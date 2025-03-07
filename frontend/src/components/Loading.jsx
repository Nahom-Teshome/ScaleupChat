import {motion} from 'framer-motion'

export default function Loading(){
    
    return(
        <div style={{display:"flex", gap:8,}}>
          { [0,1,2,3,4,5,6,7,8,9,10].map( (i)=>{ 
            const customColor=i%2 ===0?"black":"white"
           return( <motion.div
            key={i}
            animate={{y:[30,23.5,17,10.5,4 ,0 ,4 ,10.5,17,23.5,30,36.5,43,49.5,56,60,53.5,47,40.5,34,30],
                      x:[0 ,5   ,8 ,11  ,14,17,20,23  ,26,29  ,32,29  ,26,23  ,20,17,14  ,11,8    ,5,0]}} // Moves up and down
            // animate={{y:[29,28,26,24,22,20,18,16,14,12,11,10,8,6,4,2,1,0,1,
            //              2,4,6,7,8,10,12,14,16,18,20,22,24,26,28,30,
            //              32,34,36,38,40,42,44,46,48,50,52,53,54,56,58,59,60,59,
            //              58,56,54,52,50,48,46,44,42,40,38,36,34,32,30],
            //           x:[2,3,4,6,7,8,10,12,14,16,18,19,20,22,24,26,28,30,
            //             32,34,36,38,40,42,44,46,48,50,51,52,54,56,58,59,60,59,
            //             58,56,54,53,52,50,48,46,44,42,40,38,36,34,32,30,
            //             30,28,26,24,22,20,18,16,14,12,10,8,6,4,2,1,0,1,
            //             ]}} // Moves up and down
            transition={{repeat:Infinity,duration:.8,delay:i*.1, ease: "easeInOut",}}
            style={{
                width: 10,
                height: 10,
                backgroundColor:customColor,
                borderRadius: "50%",
                position:'fixed',
            }}
                />)})}           
        </div>
        
    )
}
                // transition={{ repeat: Infinity, duration:.6, delay: i*0.2 }} // Stagger effect  
                // ={{ x:[0,200,200,0],y:[0,0,200,200]}
                // {y:[0,30,30,0,0], x:[0,0,30,30,0]}