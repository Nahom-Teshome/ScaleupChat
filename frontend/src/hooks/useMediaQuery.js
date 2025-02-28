import {useEffect, useState} from 'react'

export function useMediaQuery(query){

    const [matches,setMatches] = useState(window.matchMedia(query).matches)

    useEffect(()=>{
        const media = window.matchMedia(query)

        const listener = ()=>setMatches(media.matches)

        media.addEventListener('change',listener)

        return ()=>{ media.removeEventListener('change',listener)}
    },[query])
// console.log("Media query return: ",matches)
    return matches
}