package backend.goldenlink.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // ✅ allowCredentials(true)일 땐 origins를 정확히 명시하는게 가장 안전
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // 프론트에서 JS로 읽을 헤더가 있으면 여기에 추가
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
