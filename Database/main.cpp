
//Listening socket & connection socket pseudo code
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

//Connection from a client pseudo-code
/* 
 * fd = socket()
 * connect(fd, address)
 * do_something_with(fd)
 * close(fd)
 *
 */ 

//Obtain a socket handle
int fd = socket(AF_INET, SOCK_STREAM, 0); //AF_INET for IPv4, SOCK_STREAM for TCP 

