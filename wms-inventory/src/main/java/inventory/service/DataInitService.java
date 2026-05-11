package inventory.service;

import inventory.entity.Member;
import inventory.repository.MemberRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DataInitService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        // DB에 admin이라는 계정이 없을 때만 새로 생성
        if (memberRepository.findByUsername("admin").isEmpty()) {
            String encodedPassword = passwordEncoder.encode("1234"); // 1234를 암호화!
            Member admin = new Member("admin", encodedPassword, "ROLE_ADMIN");
            memberRepository.save(admin);
            System.out.println("✅ 테스트 계정 생성 완료: admin / 1234");
        }
    }
}