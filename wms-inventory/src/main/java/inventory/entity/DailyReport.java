package inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "daily_report")
@Getter
@Setter
@NoArgsConstructor
public class DailyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate reportDate;
    private Long productId;
    private String productName;
    private int totalIncoming; // 하루 총 입고량
    private int totalOutgoing; // 하루 총 출고량
    private int finalStock;    // 마감 재고

    public DailyReport(LocalDate reportDate, Long productId, String productName, int totalIncoming, int totalOutgoing, int finalStock) {
        this.reportDate = reportDate;
        this.productId = productId;
        this.productName = productName;
        this.totalIncoming = totalIncoming;
        this.totalOutgoing = totalOutgoing;
        this.finalStock = finalStock;
    }
}