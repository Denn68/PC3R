import React from 'react'

// inspité de https://tailwind-elements.com/docs/standard/forms/checkbox/
const TypesVoies = ({itinerairesDataMAJ, setItinerairesDataMAJ}) => {

    const handleTypesVoiesChange = (e) => {
        if(e.target.checked) {
            if(e.target.value === "secured" && itinerairesDataMAJ.typeVoies !== "partagées") {
                setItinerairesDataMAJ({saison4: itinerairesDataMAJ.saison4, typeVoies: "protégées"});
            }
            else if(e.target.value === "shared" && itinerairesDataMAJ.typeVoies !== "protégées") {
                setItinerairesDataMAJ({saison4: itinerairesDataMAJ.saison4, typeVoies: "partagées"});
            }
            else setItinerairesDataMAJ({saison4: itinerairesDataMAJ.saison4, typeVoies: ""});
        }
        else {
            if(e.target.value === "secured" && itinerairesDataMAJ.typeVoies === "") {
                setItinerairesDataMAJ({saison4: itinerairesDataMAJ.saison4, typeVoies: "partagées"});
            }
            else if(e.target.value === "shared" && itinerairesDataMAJ.typeVoies === "") {
                setItinerairesDataMAJ({saison4: itinerairesDataMAJ.saison4, typeVoies: "protégées"});
            }
            else setItinerairesDataMAJ({saison4: itinerairesDataMAJ.saison4, typeVoies: ""});
        }
    };

    return (
    <>
        <h3 className="text-l font-bold">Types de voies</h3>
        <div className="py-5">
            <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
            <input
                className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] "
                type="checkbox"
                value="secured"
                id="checkbox-protegees"
                onChange={handleTypesVoiesChange} />
            <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="checkbox-protegees">
                Voies protégées
            </label>
            </div>

            <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
            <input
                className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] "
                type="checkbox"
                value="shared"
                id="checkbox-partagees"
                onChange={handleTypesVoiesChange} />
            <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="checkbox-partagees">
                Voies partagées
            </label>
            </div>
        </div>
    </>
  )
}

export default TypesVoies