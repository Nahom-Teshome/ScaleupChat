export async function registerServiceWorker(){
    if('serviceWorker' in navigator){
        try{
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('✅ Service Worker Registered:', registration)
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
              console.log("Existing subscription found:", existingSubscription.endpoint);
              // Unsubscribe the old one
              await existingSubscription.unsubscribe();
              console.log("Old subscription unsubscribed");
            }
            return registration
        }
        catch(error){
            console.error('❌ Service Worker Registration Failed:', error)
        }
        }
    }

    
export async function requestNotificationPermission(){
    const permission = await Notification.requestPermission()
    if(permission === 'granted'){
        console.log('✅ Notification permission granted.');
        await subscribeToPush()
    }
    else{
        console.log('❌ Notification permission Denied.');
    }
}

async function subscribeToPush(){
    // const registration = await navigator.serviceWorker.ready
    const registration = await registerServiceWorker()
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:import.meta.env.VITE_PUBLIC_KEY
    })
    try{
        
        const sub = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe/subscribe`,{
            method:'POST',
            body:JSON.stringify(subscription),
            headers:{'Content-Type':'application/json'},
            credentials:"include",
        })
        console.log('✅ Push Subscription:', await sub.json());
    }
    catch(error){
        console.warn('Error at fetch(api/subscribe/subscribe: ',error)
    }
}
// function urlBase64ToUint8Array(base64String) {
//     const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//     const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
//     for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
//   }