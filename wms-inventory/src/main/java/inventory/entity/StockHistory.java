package inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class StockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;     // 어떤 상품인가
    private String productName; // 상품명 (나중에 상품이 삭제되어도 기록은 남아야 하므로 저장)
    private Integer amount;     // 변동 수량 (예: +5, -3)
    private String type;        // 타입 (입고, 출고, 등록, 삭제)
    private LocalDateTime createdAt; // 기록 시간

    // 생성 시 자동으로 시간 기록
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}