package inventory.config;

import inventory.entity.DailyReport;
import inventory.entity.Product;
import inventory.entity.StockHistory;
import inventory.repository.DailyReportRepository;
import inventory.repository.ProductRepository;
import inventory.repository.StockHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class BatchConfig {

    private final StockHistoryRepository stockHistoryRepository;
    private final ProductRepository productRepository;
    private final DailyReportRepository dailyReportRepository;

    /**
     * 1. Job 정의
     * 배치의 실행 단위이며, 하나의 Job 안에 여러 Step이 포함될 수 있습니다.
     */
    @Bean
    public Job dailyReportJob(JobRepository jobRepository, Step dailyReportStep) {
        return new JobBuilder("dailyReportJob", jobRepository)
                .start(dailyReportStep)
                .build();
    }

    /**
     * 2. Step 정의
     * 실질적인 데이터 처리(Read -> Process -> Write)가 일어나는 단위입니다.
     * 여기서는 chunk 단위를 10으로 설정하여 10개씩 묶어서 트랜잭션을 처리합니다.
     */
    @Bean
    public Step dailyReportStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("dailyReportStep", jobRepository)
                .<List<StockHistory>, DailyReport>chunk(10, transactionManager)
                .reader(dailyReportReader())
                .processor(dailyReportProcessor())
                .writer(dailyReportWriter())
                .build();
    }

    /**
     * 3. Reader (읽기)
     * 오늘(00:00:00 ~ 23:59:59) 발생한 모든 StockHistory 데이터를 읽어옵니다.
     */
    @Bean
    public ItemReader<List<StockHistory>> dailyReportReader() {
        return new ItemReader<List<StockHistory>>() {
            private boolean isRead = false;

            @Override
            public List<StockHistory> read() {
                // 배치는 여러 번 호출되므로 한 번 읽었으면 null을 반환하여 종료 신호를 줍니다.
                if (isRead) {
                    return null;
                }

                LocalDate today = LocalDate.now();
                LocalDateTime startOfDay = today.atStartOfDay();
                LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

                log.info("⏰ [Batch Reader] 오늘 날짜({})의 히스토리 조회 시작", today);
                List<StockHistory> histories = stockHistoryRepository.findByCreatedAtBetween(startOfDay, endOfDay);

                isRead = true;
                return histories.isEmpty() ? null : histories;
            }
        };
    }

    /**
     * 4. Processor (가공/비즈니스 로직)
     * 읽어온 전체 히스토리를 상품별로 그룹핑하여 하루 총 입고량, 출고량을 계산합니다.
     */
    @Bean
    public ItemProcessor<List<StockHistory>, DailyReport> dailyReportProcessor() {
        return histories -> {
            log.info("🔄 [Batch Processor] 총 {}건의 히스토리 데이터 정산 시작", histories.size());

            // 특정 날짜 정산을 진행하므로 첫 번째 데이터 혹은 오늘 날짜 기준으로 마감 보고서 작성
            LocalDate today = LocalDate.now();

            // 상품별로 입고/출고 합산하기 위한 임시 Map 구조
            // Key: ProductId, Value: [입고합산, 출고합산]
            Map<Long, int[]> accumulationMap = new HashMap<>();

            for (StockHistory history : histories) {
                Long productId = history.getProductId();
                accumulationMap.putIfAbsent(productId, new int[]{0, 0}); // [입고, 출고]

                int[] counts = accumulationMap.get(productId);
                if ("입고".equals(history.getType())) {
                    counts[0] += history.getAmount();
                } else if ("출고".equals(history.getType())) {
                    counts[1] += Math.abs(history.getAmount()); // 음수로 저장되어 있을 경우를 대비해 절대값 처리
                }
            }

            // 현재 시스템에 등록된 모든 상품 정보를 긁어와 마감 재고(finalStock) 매칭
            List<Product> allProducts = productRepository.findAll();
            List<DailyReport> reports = new ArrayList<>();

            for (Product product : allProducts) {
                int[] counts = accumulationMap.getOrDefault(product.getId(), new int[]{0, 0});

                DailyReport report = new DailyReport(
                        today,
                        product.getId(),
                        product.getName(),
                        counts[0], // totalIncoming
                        counts[1], // totalOutgoing
                        product.getStock() // 마감 시점의 최종 재고
                );

                // Writer에 리스트 형태로 넘겨주기 위해 임시 보관 (여기는 편의상 단건 빌더 구조를 활용)
                dailyReportRepository.save(report);
            }

            log.info("✅ [Batch Processor] 상품별 마감 정산 완료");
            return null; // Processor 내부에서 강제로 저장 처리를 끝냈으므로 null 혹은 로깅용 객체 반환
        };
    }

    /**
     * 5. Writer (쓰기)
     * 가공 완료된 DailyReport 리스트를 DB에 일괄 저장합니다.
     * (여기서는 Processor가 일괄 검증 처리를 끝내서 로그 기록용으로 배치 라이프사이클을 마감합니다.)
     */
    @Bean
    public ItemWriter<DailyReport> dailyReportWriter() {
        return chunk -> {
            log.info("💾 [Batch Writer] 일일 보고서 정산 데이터 최종 적재 마감완료");
        };
    }
}