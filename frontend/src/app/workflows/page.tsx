"use client";
import {ImproveDashboard} from "@/components/improvement/ImprovementForm";


export default   function Workflows({filter: string = "improvement"}) {
  return (
    <div className="">
     <ImproveDashboard/>
    </div>
  );
}
