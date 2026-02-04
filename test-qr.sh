#!/bin/bash

echo "🧪 Testing QR Code Generation..."

# Test if zxing is working
cat > /tmp/TestQR.java << 'EOF'
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.io.ByteArrayOutputStream;

public class TestQR {
    public static void main(String[] args) {
        try {
            String text = "https://snet.io.vn/test";
            BitMatrix bitMatrix = new MultiFormatWriter()
                .encode(text, BarcodeFormat.QR_CODE, 400, 400);
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            byte[] qrCode = baos.toByteArray();
            
            System.out.println("✅ QR Code generated: " + qrCode.length + " bytes");
            
            // Save to file
            java.nio.file.Files.write(
                java.nio.file.Paths.get("/tmp/test-qr.png"), 
                qrCode
            );
            System.out.println("✅ Saved to /tmp/test-qr.png");
            
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
EOF

echo "📝 Compiling test..."
cd /home/hv/DuAn/snet/backend

# Compile with Maven dependencies
mvn exec:java -Dexec.mainClass="TestQR" -Dexec.classpathScope=compile -q 2>/dev/null

if [ -f /tmp/test-qr.png ]; then
    echo "✅ QR code test successful!"
    echo "📁 File: /tmp/test-qr.png ($(stat -f%z /tmp/test-qr.png 2>/dev/null || stat -c%s /tmp/test-qr.png) bytes)"
    rm /tmp/test-qr.png
else
    echo "❌ QR code generation failed!"
fi

rm /tmp/TestQR.java 2>/dev/null
