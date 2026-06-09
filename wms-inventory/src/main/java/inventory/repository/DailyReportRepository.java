package inventory.repository;

import inventory.entity.DailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {
    List<DailyReport> findByReportDate(LocalDate reportDate);
}