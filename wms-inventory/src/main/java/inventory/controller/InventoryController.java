package inventory.controller; // 준성님 현재 경로에 딱 맞는 선언입니다!

import inventory.entity.Product;
import org.springframework.web.bind.annotation.*;
import inventory.repository.ProductRepository;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")

public class InventoryController {

    private final ProductRepository productRepository;

    // 생성자 주입
    public InventoryController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/api/inventory")
    public List<Product> getInventory() {
        return productRepository.findAll(); // DB에 있는 모든 상품을 가져오기
    }
    @PostMapping("/api/inventory") // 데이터를 등록할 때는 PostMapping
    public Product addProduct(@RequestBody Product product) {
        // 리액트가 보낸 JSON 데이터를 Product 객체로 바꿔서 DB에 저장
        return productRepository.save(product);
    }

}