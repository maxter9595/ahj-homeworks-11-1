import { ajax } from "rxjs/ajax";
import { interval, of } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";

export default class MessageWidget {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
    this.allMessages = [];
    this.lastReceivedTime = 0;
    this.init();
  }

  init() {
    this.startPolling();
  }

  formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}.${month}.${year}`;
  }

  truncateSubject(subject) {
    return subject.length > 15 ? subject.substring(0, 15) + "..." : subject;
  }

  updateTable(newMessages) {
    const tbody = document.getElementById("messages-body");
    const filteredMessages = newMessages.filter(
      (message) => message.received > this.lastReceivedTime,
    );
    if (filteredMessages.length > 0) {
      this.lastReceivedTime = Math.max(
        ...filteredMessages.map((message) => message.received),
      );
      this.allMessages = [...filteredMessages, ...this.allMessages];
      this.allMessages.sort((a, b) => b.received - a.received);
      tbody.innerHTML = "";
      this.allMessages.forEach((message) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${message.from}</td>
          <td>${this.truncateSubject(message.subject)}</td>
          <td>${this.formatDate(message.received)}</td>
        `;
        tbody.appendChild(row);
      });
    }
  }

  startPolling() {
    const poll$ = interval(5000).pipe(
      switchMap(() =>
        ajax.getJSON(`${this.baseUrl}/messages/unread`).pipe(
          map((response) => response),
          catchError((error) => {
            console.error("Error fetching messages:", error.message || error);
            return of({ status: "error", messages: [] });
          }),
        ),
      ),
    );

    poll$.subscribe((response) => {
      console.log("Response:", response);
      if (response.status === "ok") {
        console.log("Updating table with messages:", response.messages);
        this.updateTable(response.messages);
      }
    });
  }
}
