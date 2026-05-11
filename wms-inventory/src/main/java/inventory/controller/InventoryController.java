package inventory.controller;

import inventory.entity.Product;
import inventory.entity.StockHistory;
import inventory.repository.ProductRepository;
import inventory.repository.StockHistoryRepository;
import inventory.service.ExcelService; // [추가]
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

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final ProductRepository productRepository;
    private final StockHistoryRepository stockHistoryRepository;
    private final ExcelService excelService; // [추가]

    // [수정] 생성자에 ExcelService 추가
    public InventoryController(ProductRepository productRepository,
                               StockHistoryRepository stockHistoryRepository,
                               ExcelService excelService) {
        this.productRepository = productRepository;
        this.stockHistoryRepository = stockHistoryRepository;
        this.excelService = excelService;
    }

    /**
     * [통합 및 페이징 적용]
     */
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
}