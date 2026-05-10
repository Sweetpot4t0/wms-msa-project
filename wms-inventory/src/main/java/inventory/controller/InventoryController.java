package inventory.controller;

import inventory.entity.Product;
import inventory.entity.StockHistory;
import inventory.repository.ProductRepository;
import inventory.repository.StockHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final ProductRepository productRepository;
    private final StockHistoryRepository stockHistoryRepository;

    public InventoryController(ProductRepository productRepository, StockHistoryRepository stockHistoryRepository) {
        this.productRepository = productRepository;
        this.stockHistoryRepository = stockHistoryRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // 수량 업데이트 (동시성 제어 적용)
    @PatchMapping("/{id}/stock")
    @Transactional
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            int oldStock = product.getStock();
            int newStock = Integer.parseInt(request.get("stock").toString());
            int diff = newStock - oldStock;

            // 비즈니스 로직: 재고 0 미만 방지
            if (newStock < 0) {
                return ResponseEntity.badRequest().body("재고는 0개 미만일 수 없습니다.");
            }

            // 1. 재고 수정 (엔티티의 @Version 필드에 의해 낙관적 락 발동)
            product.setStock(newStock);
            Product updatedProduct = productRepository.save(product);

            // 2. 히스토리 기록 저장
            StockHistory history = new StockHistory();
            history.setProductId(product.getId());
            history.setProductName(product.getName());
            history.setAmount(diff);
            history.setType(diff > 0 ? "입고" : "출고");
            stockHistoryRepository.save(history);

            return ResponseEntity.ok(updatedProduct);

        } catch (ObjectOptimisticLockingFailureException e) {
            // 여러 명이 동시에 수정하여 버전이 맞지 않을 때 발생하는 예외
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
}