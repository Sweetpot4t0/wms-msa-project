package inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // 로그인 아이디

    @Column(nullable = false)
    private String password; // 암호화된 비밀번호

    private String role; // 권한 (예: ROLE_USER, ROLE_ADMIN)

    // 테스트용 생성자
    public Member(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}