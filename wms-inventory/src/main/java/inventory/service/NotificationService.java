package inventory.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    // 동시성 문제를 해결하기 위해 Thread-Safe한 리스트 사용
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // 리액트가 연결 요청을 보냈을 때 파이프라인 생성
    public SseEmitter subscribe() {
        // 만료 시간 1시간 설정
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L);
        this.emitters.add(emitter);

        // 연결 종료, 타임아웃, 에러 발생 시 리스트에서 안전하게 제거
        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError((e) -> this.emitters.remove(emitter));

        // 최초 연결 시 503 에러 방지용 더미 데이터 전송
        try {
            emitter.send(SseEmitter.event().name("connect").data("connected!"));
        } catch (IOException e) {
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    // 재고 부족 발생 시 모든 접속한 브라우저(리액트)에 푸시 알림 발송
    public void sendNotification(String productName, int currentStock) {
        String message = String.format("[%s] 상품의 재고가 %d개 남았습니다. 확인 필요!", productName, currentStock);

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("stock-warning").data(message));
            } catch (IOException e) {
                this.emitters.remove(emitter); // 연결 끊어진 브라우저는 리스트에서 제거
            }
        }
    }
}