CC = gcc
CFLAGS = -Wall -pthread -g
TARGET = main

SRCS = main.c tapis.c
OBJS = main.o tapis.o

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

main.o: main.c tapis.h
	$(CC) $(CFLAGS) -c main.c

tapis.o: tapis.c tapis.h
	$(CC) $(CFLAGS) -c tapis.c

clean:
	rm -f $(OBJS) $(TARGET)

run: $(TARGET)
	./$(TARGET)

# Le MakeFile a été fait par ChatGpt
