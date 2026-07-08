package com.example.ecommercedemo

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ecommercedemo.ui.theme.ECommerceDemoTheme
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

class MainActivity : ComponentActivity() {

    private val paynowScanUrl =
        "https://paynow-deeplink-demo.surge.sh/?amount=50.00&ref=REF123&proxy=91234567" // encoded in the QR

    private val paynowTapUri =
        "paynowsg://pay?amount=50.00&ref=REF123&proxy=91234567" // used when tapped in-app

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ECommerceDemoTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    CheckoutScreen(paynowScanUrl, paynowTapUri)
                }
            }
        }
    }
}

@Composable
fun CheckoutScreen(scanUrl: String, tapUri: String) {
    val context = LocalContext.current
    val qrBitmap = remember { generateQrBitmap(scanUrl, 600) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Wireless Headphones", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("SGD 50.00", fontSize = 18.sp, modifier = Modifier.padding(bottom = 24.dp))
        Text("Scan or tap to pay with PayNow", modifier = Modifier.padding(bottom = 12.dp))

        Image(
            bitmap = qrBitmap.asImageBitmap(),
            contentDescription = "PayNow QR Code",
            modifier = Modifier
                .size(240.dp)
                .clickable {
                    // Tapping simulates "I scanned this" for demo purposes -
                    // emulators don't have a real camera to scan their own screen.
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(tapUri))
                    val chooser = Intent.createChooser(intent, "Choose a bank app")
                    context.startActivity(chooser)
                }
        )
    }
}

fun generateQrBitmap(text: String, size: Int): Bitmap {
    val writer = QRCodeWriter()
    val bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, size, size)
    val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
    for (x in 0 until size) {
        for (y in 0 until size) {
            bmp.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
        }
    }
    return bmp
}