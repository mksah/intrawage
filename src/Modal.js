import React from 'react';
import ReactDOM from 'react-dom';
import {ToggleButtonGroup, ToggleButton, Checkbox, Slider} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import axios from 'axios';


function Modal(props) {
    const [formData, setFormData] = React.useState({
        transportation: "car",
        rentLoc: "city",
        roommates: false,
        sharedRoom: false,
        percentRestaurant: 10,
        calculatedCurrency: props.calculatedCurrency,
        city: props.city
    });

    const handleChange = (event, newVal) => {
        const {name, value, type, checked} = event.target
        console.log(formData)
        // console.log(value)
        // console.log(newVal)
        // console.log(type)
        // console.log(name)
        let finVal
        newVal === "car" || newVal === "bus" || newVal === "none" ? finVal = newVal : finVal = value
        let finName
        name === undefined ? finName = "transportation" : finName = name
        console.log(finVal)
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [finName]: type === "checkbox" ? checked : finVal
            }
        })
    };
    function handleSubmit(event) {
        event.preventDefault()
        axios.post ('http://localhost:8000/costOfLiving', formData)
            .then(res => {props.setItemizedFinances(res.data == {} ? "N/A": res.data); console.log(JSON.stringify(res.data))})
        props.setModalData(formData)
    }

    return (
        <div className="absolute bg-black bg-opacity-50 h-[100%] w-[100%] z-[2]">
            <div className="rounded-[20px] bg-white  lg:w-[30%] lg:mx-[35vw] mx-[10vw] my-[15vh]">
                <p className="flex justify-center pt-[7%] font-extrabold text-[3vh]">Customize</p>
                <form onSubmit={handleSubmit}>
                <div className="flex justify-center pt-[5%] font-semibold text-[2vh]">
                    <p className="mr-[2%] my-[2%]">Transportation: </p>
                    <ToggleButtonGroup
                        color="primary"
                        value={formData.transportation}
                        exclusive
                        onChange={handleChange}
                        aria-label="Platform"
                        name="transportation"
                        type="select"
                    >
                        <ToggleButton name="transportation" value="car" >
                            <DirectionsCarIcon  type="button"/>
                        </ToggleButton>
                        <ToggleButton name="transportation" value="bus" >
                            <DirectionsBusIcon  type="button"/>
                        </ToggleButton>
                        <ToggleButton name="transportation" value="none" >
                            <NotInterestedIcon type="button" />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className="flex justify-center pt-[5%] font-semibold text-[2vh]">
                    <p className="mr-[2%] my-[2%]">Rent: </p>
                    <ToggleButtonGroup
                        color="primary"
                        value={formData.rentLoc}
                        exclusive
                        onChange={handleChange}
                        aria-label="Platform"
                        name="rentLoc"
                        type="select"
                    >
                        <ToggleButton name="rentLoc" value="city" style={{textTransform: 'none'}}>City Center</ToggleButton>
                        <ToggleButton name="rentLoc" value="suburb" style={{textTransform: 'none'}}>Suburb</ToggleButton>
                        <ToggleButton name="rentLoc" value="none" style={{textTransform: 'none'}}>None</ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className="flex justify-center pt-[0%] font-semibold text-[2vh]">
                    <Checkbox 
                        type="checkbox"
                        checked={formData.roommates}
                        onChange={handleChange}
                        name="roommates"
                    />
                    <p className="mr-[2%] my-[2%] text-[1.7vh] font-medium">Roommates?</p>
                    <Checkbox 
                        type="checkbox"
                        checked={formData.sharedRoom}
                        onChange={handleChange}
                        name="sharedRoom"
                    />
                    <p className="mr-[2%] my-[2%] text-[1.7vh] font-medium">Shared Room?</p>
                </div>
                <div className="flex justify-center pt-[3%] font-semibold text-[2vh] mx-[10%]">
                    <p className="mr-[2%] ">Food: </p>
                    <p className="mr-[2%] my-[0.5%] text-[1.7vh] font-medium ">Groceries </p>
                    <Slider
                    size="small"
                    value={formData.percentRestaurant}
                    onChange={handleChange}
                    name="percentRestaurant"
                    aria-label="small"
                    valueLabelDisplay="auto"
                    />
                    <p className="px-[2%] my-[0.5%] text-[1.7vh] font-medium ">Restaurants</p>
                </div>
                <div className="flex justify-center pt-[4%] font-semibold text-[2vh] mx-[10%]">
                    <button className="relative bottom-[5px] bg-black text-white font-bold rounded-[30px] px-[2.5%] py-[2%] mb-[6%]">Submit</button>
                </div>
                </form>
                {/* {itemizedFinances != null && <p>{JSON.stringify(itemizedFinances)}</p>} */}
            </div>
        </div>
    )
}
export default Modal;