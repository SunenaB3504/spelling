package com.example.spellingapp

import android.os.Bundle
import android.view.View
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize WebView
        webView = findViewById(R.id.webView)
        
        // Configure WebView settings
        webView.settings.apply {
            javaScriptEnabled = true  // Enable JavaScript
            domStorageEnabled = true  // Enable DOM storage
            databaseEnabled = true    // Enable database
            // TODO: Add file access for offline downloads
        }
        
        // Set WebView client
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                // TODO: Handle connection errors and display offline content
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // TODO: Hide loading indicator when page loads
            }
        }
        
        // Load the website
        webView.loadUrl("https://yourspellingwebsite.com")
        
        // Set full screen
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN)
        
        // TODO: Implement native spell check integration
        // TODO: Add native speech recognition for pronunciation checking
        // TODO: Implement offline content synchronization
        // TODO: Add push notifications for reminders
    }
    
    // Handle back button to navigate within WebView
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
