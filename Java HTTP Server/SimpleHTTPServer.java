import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.time.LocalDate;

/**
 * Java program to create a simple HTTP Server
 * to demonstrate how to use ServerSocket and Socket class.
 */

public class SimpleHTTPServer {
  public static void main(String[] args) throws Exception {
    ServerSocket server = new ServerSocket(8080);
    System.out.println("Listening on port 8080...");
    while (true) {
      try (Socket socket = server.accept()) {
        LocalDate today = LocalDate.now();
        String httpResponse = "HTTP/1.1 200 OK\r\n\r\n" + today;
        socket.getOutputStream().write(httpResponse.getBytes("UTF-8"));
      }
    }
  }
}

/**
 * ServerSocket receives connections in Server application
 * Socket is used to send and receive data from individual clients
 */
