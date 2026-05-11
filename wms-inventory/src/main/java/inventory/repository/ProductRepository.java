package inventory.repository;

import inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // [추가]
import org.springframework.stereotype.Repository;
import java.util.List; // [추가]

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // [추가] 재고 상태별 통계를 가져오는 쿼리
    @Query(value = "SELECT " +
            "CASE WHEN stock = 0 THEN '품절' " +
            "WHEN stock <= 50 THEN '재고부족' " +
            "ELSE '안정' END as status, " +
            "COUNT(*) as count " +
            "FROM product GROUP BY status", nativeQuery = true)
    List<Object[]> getStockStatusStats();
}