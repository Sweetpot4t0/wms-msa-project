package inventory.repository;

import inventory.entity.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    // 특정 상품의 이력만 모아보기 기능 (나중에 사용)
    List<StockHistory> findByProductIdOrderByCreatedAtDesc(Long productId);

    // 전체 이력을 최신순으로 보기
    List<StockHistory> findAllByOrderByCreatedAtDesc();
    // StockHistoryRepository.java 안의 내용
    List<StockHistory> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}