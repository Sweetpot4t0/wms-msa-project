package inventory.repository; // 파일이 있는 폴더명

import org.springframework.data.jpa.repository.JpaRepository;
import inventory.entity.Product; //

public interface ProductRepository extends JpaRepository<Product, Long> {
}