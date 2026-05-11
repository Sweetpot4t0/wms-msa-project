package inventory.service;

import inventory.entity.Product;
import inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final ProductRepository productRepository;

    public ByteArrayInputStream downloadProductExcel() throws IOException {
        List<Product> products = productRepository.findAll();

        // 1. 엑셀 워크북(파일) 생성
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("재고 현황");

            // 2. 헤더 스타일 설정 (굵게, 배경색)
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

// 3. 헤더 행 생성
            String[] headers = {"ID", "상품명", "현재 재고", "상태", "버전"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 4. 데이터 행 삽입
            int rowIdx = 1;
            for (Product p : products) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getName());
                row.createCell(2).setCellValue(p.getStock());

                // 재고 상태 계산 (아까 프론트 로직이랑 맞춤)
                String status = p.getStock() > 50 ? "안정" : (p.getStock() <= 0 ? "품절" : "재고부족");
                row.createCell(3).setCellValue(status);

                row.createCell(4).setCellValue(p.getVersion() != null ? p.getVersion() : 0);
            }

            // 열 너비 자동 조절
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}