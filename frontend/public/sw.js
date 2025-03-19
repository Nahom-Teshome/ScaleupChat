
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Activate immediately
  });
  
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  console.log("Service Worker activated and claimed clients");
    console.log("Service Worker activated");
  });
self.addEventListener('push',async(event)=>{
    const rawData = event.data? event.data.text():{}
    console.log('Push event received', rawData)
    const data = JSON.parse(rawData)
    console.log("Attempting to show notification with title:", data.title,)
    event.waitUntil(
        self.registration.showNotification(data.title,{
            body:data.body,
            icon:'/chat.png',
            vibrate:[200,100,200]
        }).then(()=>{console.log('success! showing notifications')})
        .catch((error)=>{console.log("Error showing notifications : ", error)})
    )
})

self.addEventListener('notificationClicked',event=>{
    event.notification.close()
    event.waitUntil(
      self.clients.openWindow("http:/localhost:5173")
        
    )
})