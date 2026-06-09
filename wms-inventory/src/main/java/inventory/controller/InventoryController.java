package inventory.controller;

import inventory.entity.DailyReport;
import inventory.entity.Product;
import inventory.entity.StockHistory;
import inventory.repository.DailyReportRepository;
import inventory.repository.ProductRepository;
import inventory.repository.StockHistoryRepository;
import inventory.service.ExcelService;
import inventory.service.NotificationService; // [추가]
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter; // [추가]

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final ProductRepository productRepository;
    private final StockHistoryRepository stockHistoryRepository;
    private final ExcelService excelService;
    private final NotificationService notificationService; // [추가]
    private final DailyReportRepository dailyReportRepository;


    public InventoryController(ProductRepository productRepository,
                               StockHistoryRepository stockHistoryRepository,
                               ExcelService excelService,
                               NotificationService notificationService, DailyReportRepository dailyReportRepository) {
        this.productRepository = productRepository;
        this.stockHistoryRepository = stockHistoryRepository;
        this.excelService = excelService;
        this.notificationService = notificationService;
        this.dailyReportRepository = dailyReportRepository;
    }

    // [추가] 실시간 알림 구독 엔드포인트
    @GetMapping(value = "/notifications", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeNotifications() {
        return notificationService.subscribe();
    }

    @GetMapping
    public Page<Product> getProducts(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());

        if (name.trim().isEmpty()) {
            return productRepository.findAll(pageable);
        }
        return productRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PatchMapping("/{id}/stock")
    @Transactional
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            int oldStock = product.getStock();
            int newStock = Integer.parseInt(request.get("stock").toString());
            int diff = newStock - oldStock;

            if (newStock < 0) {
                return ResponseEntity.badRequest().body("재고는 0개 미만일 수 없습니다.");
            }

            product.setStock(newStock);
            Product updatedProduct = productRepository.save(product);

            StockHistory history = new StockHistory();
            history.setProductId(product.getId());
            history.setProductName(product.getName());
            history.setAmount(diff);
            history.setType(diff > 0 ? "입고" : "출고");
            stockHistoryRepository.save(history);

            // [추가] 재고가 10개 미만으로 떨어지면 실시간 알림 전송 권장
            if (newStock < 10) {
                notificationService.sendNotification(product.getName(), newStock);
            }

            return ResponseEntity.ok(updatedProduct);

        } catch (ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("다른 사용자가 이미 수정 중입니다. 새로고침 후 다시 시도해주세요.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 에러가 발생했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }

    @GetMapping("/history")
    public List<StockHistory> getHistory() {
        return stockHistoryRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/stats")
    public Map<String, Long> getInventoryStats() {
        List<Object[]> results = productRepository.getStockStatusStats();
        Map<String, Long> stats = new HashMap<>();

        stats.put("품절", 0L);
        stats.put("재고부족", 0L);
        stats.put("안정", 0L);

        for (Object[] result : results) {
            String status = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            stats.put(status, count);
        }
        return stats;
    }

    @GetMapping("/excel")
    public ResponseEntity<InputStreamResource> downloadExcel() throws IOException {
        String filename = "inventory_report.xlsx";
        InputStreamResource file = new InputStreamResource(excelService.downloadProductExcel());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
    @GetMapping("/report/excel")
    public ResponseEntity<InputStreamResource> downloadReportExcel(@RequestParam("date") String dateStr) {
        // 파라미터로 받은 날짜(예: 2026-06-08)의 데이터를 조회
        LocalDate date = LocalDate.parse(dateStr);
        List<DailyReport> reports = dailyReportRepository.findByReportDate(date);

        ByteArrayInputStream in = excelService.downloadDailyReportExcel(reports);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=daily_inventory_report_" + dateStr + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}