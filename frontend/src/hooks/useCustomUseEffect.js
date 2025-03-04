import {useRef} from 'react'
import { useSocketContext } from './useSocketContext'
export const useCustomUseEffect=(sock)=>{
     const oldDependency = useRef([])
    //  const {socket} = useSocketContext()
    const customUseEffect=(callBack,dependecy)=>{
                
                if(dependecy[0]===null){
                  console.log("dependency is null ")
                    return
                  }
                //   console.log("OldDependancy: ",oldDependancy.current, 'AND dependancy: ',dependacy)
                if(oldDependency.current.length ===0){
                      oldDependency.current= [dependecy[0]]
                      return callBack(sock)
                  }
                  if(oldDependency.current.length === 1)
                      {
                          oldDependency.current.push(dependecy[0])
                        //   console.log("oldDependancy before shift: ",oldDependancy.current)
                          if(oldDependency.current[0] !== dependecy[0])
                              {
                                  oldDependency.current.shift()
                                //   console.log("oldDependancy after shift: ",oldDependancy.current)
                                  return callBack(sock)
                              }
                              oldDependency.current.shift()
                      }
              
                  
            }

            return {customUseEffect}
}