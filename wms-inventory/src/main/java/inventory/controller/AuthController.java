package inventory.controller;

import inventory.entity.Member;
import inventory.repository.MemberRepository;
import inventory.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody AuthRequest request) {
        // 1. 아이디 확인
        Member member = memberRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 ID 입니다."));

        // 2. 비밀번호 확인 (암호화된 것과 비교)
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        // 3. 토큰 생성 및 반환
        String token = jwtTokenProvider.createToken(member.getUsername(), member.getRole());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return response;
    }
}