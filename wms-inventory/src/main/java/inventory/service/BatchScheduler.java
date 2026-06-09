package inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job dailyReportJob;

    /**
     *  테스트를 위해 매 1분마다 배치를 실행하는 스케줄러입니다.
     * (실무용 크론식 예시 - 매일 새벽 0시: @Scheduled(cron = "0 0 0 * * *"))
     */
    @Scheduled(cron = "0 0 1 * * *") // 새벽1시 고정
    public void runDailyReportJob() {
        try {
            log.info("⏰ [Scheduler] 일일 재고 정산 배치 스케줄러 가동 시작...");

            // 스프링 배치는 동일한 파라미터로 Job을 다시 실행할 수 없으므로,
            // 실행할 때마다 현재 타임스탬프를 파라미터로 넘겨 고유성을 보장합니다.
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(dailyReportJob, jobParameters);

            log.info("✅ [Scheduler] 배치 Job이 성공적으로 요청되었습니다.");
        } catch (Exception e) {
            log.error("❌ [Scheduler] 배치 Job 실행 중 에러가 발생했습니다: ", e);
        }
    }
}