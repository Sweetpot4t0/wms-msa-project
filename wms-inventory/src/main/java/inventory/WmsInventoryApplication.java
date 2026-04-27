package inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {"inventory/entity"})         // 준성님의 entity 폴더 인식
@EnableJpaRepositories(basePackages = {"inventory/repository"}) // 준성님의 repository 폴더 인식
public class WmsInventoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(WmsInventoryApplication.class, args);
    }
}