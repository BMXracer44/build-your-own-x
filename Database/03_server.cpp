#include <asm-generic/socket.h>
#include <cstddef>
#include <cstdint>
#include <iterator>
#include <netinet/in.h>
#include <netinet/ip.h> //Superset of previous
#include <sys/socket.h>
#include <sys/types.h>
// Listening socket & connection socket pseudo code
/*
 * fd = socket() obtain a socket handle
 * bind(fd, address) Set listening IP port
 * listen(fd) Create listening socket
 * while(true){
 *  conn_fd = accept(fd)
 *  do_something_with(conn_fd)
 *  close(conn_fd)
 * }
 *
 * Then use the accept() API to wait for incoming TCP connections
 */

// Connection from a client pseudo-code
/*
 * fd = socket()
 * connect(fd, address)
 * do_something_with(fd)
 * close(fd)
 *
 */

// Obtain a socket handle
int fd =
    socket(AF_INET, SOCK_STREAM, 0); // AF_INET for IPv4, SOCK_STREAM for TCP
if (fd < 0) {
  die("socker()");
}

struct sockaddr_in addr = {};
addr.sin_family = AF_INET;
addr.sin_port = ntohs(1234);
addr.sin_addr.s_addr = ntohl(INADDR_LOOPBACK); // 127.0.0.1
int rv = connect(fd, (const struct sockaddr *)&addr, sizeof(addr));
if (rv) {
  die("connect");
}

char msg[] = "Hello";
write(fd, msg, strlen(msg));

char rbuf[64] = {};
ssize_t n = read(fd, rbuf, sizeof(rbuf) - 1);
if (n < 0) {
  die("read");
}
printf("Server says: %s\n", rbuf);
close(fd);
