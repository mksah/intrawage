
import React from 'react';
import axios from 'axios';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import IncomeTaxCalc from './IncomeTaxCalc';
import Dropdown from 'react-dropdown'
import Select from 'react-select' 
import {components} from 'react-select' 
import './dropdown.css';
import TaxData from './data/International Income Tax Calculator.json'
import removeAccent from 'remove-accents'
import Modal from './Modal'
import { useNavigate } from 'react-router-dom'
function HomePage() {
    const NUMBEO_API_KEY = "qk9iaz7bvg3yjp";
    const navigate = useNavigate()

    //Google Maps API Data (City Input)
    const [loading, setLoading] = React.useState(false)
    const [country, setCountry] = React.useState(null)
    const [city, setCity] =  React.useState('')
    const [state, setState] = React.useState(null)

    //Profession, Income, and Currency Data
    const [householdIncome, setHouseholdIncome] = React.useState(null)
    const [profession, setProfession] = React.useState(null)
    const [selectedCurrency, setSelectedCurrency] = React.useState(null)
    const [calculatedCurrency, setCalculatedCurrency] = React.useState("USD")

    //Numbeo API Data
    // const [numbeo, setNumbeo] = React.useState(null)    
    // const [numbeo2, setNumbeo2] = React.useState(null)    
    const [exchangeRate, setExchangeRate] = React.useState(null)

    //Income Tax Data
    const [currency, setCurrency] = React.useState("")

    //Job Salary Web Scraper Data
    const [salary, setSalary] = React.useState(null)

    //Google Cloud Talent API
    const [profAuto, setProfAuto] = React.useState(null)
    const [selectedProfession, setSelectedProfession] = React.useState(null)

    //Figures
    const [netIncome, setNetIncome] = React.useState(null);
    const [taxBreakdown, setTaxBreakdown] = React.useState(null);
    const [convertedNetIncome, setConvertedNetIncome] = React.useState(null);
    const [convertedGrossIncome, setConvertedGrossIncome] = React.useState(null);
    const [rent, setRent] = React.useState(null);
    const [livingExpenses, setLivingExpenses] = React.useState(null);

    //Modal
    const [openModal, setOpenModal] = React.useState(false);
    const [modalData, setModalData] = React.useState(null);
    const [itemizedFinances, setItemizedFinances] = React.useState(null);

    //Event Handlers
    function handleIncomeChange(event) {
      setHouseholdIncome(event.target.value)
    }

    function handleCurrencyChange(event) {
      setSelectedCurrency(event.value.substring(0, 3))
    }

    function handleCalcCurrencyChange(event) {
      setCalculatedCurrency(event.value.substring(0, 3))
    }
    function handleProfessionChange(event) {
      setProfession(event.target.value)
    }

    function handleSelectedProfessionChange(event) {
      setSelectedProfession(event.target.outerText)
      setProfession(event.target.outerText)
      setProfAuto(null)
    }

    //Job Salary Web Scraper API
    React.useEffect(() => {
      // console.log(city)
      // console.log(country)
      // console.log(selectedProfession)
      if (city !== '' && country !== null && selectedProfession !== null) {
        const dashedProfession = selectedProfession.replace(/ /g, '-')
        const dashedCity = city.replace(/ /g, '-')
        const dashedCountry = country.replace(/ /g, '-')
        let dashedState = null
        if(state != null) {
          dashedState = state.replace(/ /g, '-')
        }
        console.log(dashedProfession + "/" + dashedCountry + "/" + dashedCity)
        const info = {dashedCity, dashedCountry, dashedProfession, dashedState};
        axios.post ('http://localhost:8000/message', info)
            .then(res => {setSalary(res.data); setHouseholdIncome(res.data)})
      }
    }, [city, country, selectedProfession])

    //Google Cloud Talent API 
    React.useEffect(() => {
      if (profession !== null && selectedProfession === null) {
        axios.post ('http://localhost:8000/profauto', {profession})
            .then(res => {setProfAuto(res.data)})
      }
    }, [profession])



    //Numbeo API Calls after sumbitting + Rent and Living Expenses Calculation
    async function handleSubmit(event) {
        setLoading(true)
        event.preventDefault()
        console.log(city + "," + country)
        // await axios 
        // .get(`https://www.numbeo.com/api/city_prices?api_key=${NUMBEO_API_KEY}&query=${city},${country}&currency=${calculatedCurrency}`)
        //   .then(res => setNumbeo(res.data))
        // await axios 
        // .get(`https://www.numbeo.com/api/city_cost_estimator?api_key=${NUMBEO_API_KEY}&query=${city},${country}&children=0&household_members=1&currency=${calculatedCurrency}`)
        //   .then(res => setNumbeo2(res.data))
        if (currency != selectedCurrency || selectedCurrency != calculatedCurrency) {
          await axios.get(`https://www.numbeo.com/api/currency_exchange_rates?api_key=${NUMBEO_API_KEY}`)
               .then(res => setExchangeRate(res.data))
        } else {
            setExchangeRate("N/A")
        }
        setOpenModal(true)     
    }

    // React.useEffect(() => {
    //   if (exchangeRate != null) {
    //     setRent(Math.round(numbeo.prices[21].average_price))
    //     setLivingExpenses(Math.round(numbeo2.overall_estimate))
    //   }
    // }, [exchangeRate])

    //Currency Conversion Calculator
    function currencyConversion(income, currency1, currency2) {
        if(currency1 !== currency2) {
        let selectedExchangeRate = null;
        let convertedExchangeRate = null; 
        for (let i = 0; i < 159; i++ ) {
          if (exchangeRate.exchange_rates[i].currency === currency1) {
              selectedExchangeRate = exchangeRate.exchange_rates[i].one_usd_to_currency
          } else if (exchangeRate.exchange_rates[i].currency === currency2) {
              convertedExchangeRate = exchangeRate.exchange_rates[i].one_usd_to_currency
          }
        }
        return (convertedExchangeRate / selectedExchangeRate) * income 
      } else {
        return income
      }
    }

    React.useEffect(() => {
      if (netIncome != null) {
        console.log(netIncome + " " + selectedCurrency + " " + calculatedCurrency)
        setConvertedNetIncome(Math.round(currencyConversion(netIncome, selectedCurrency, calculatedCurrency)))
        setConvertedGrossIncome(Math.round(currencyConversion(householdIncome, selectedCurrency, calculatedCurrency)))
        if (taxBreakdown != null) {
          let convTaxBreakdown = taxBreakdown;
          for (let i = 0; i < taxBreakdown.length; i++) {
            taxBreakdown[i][1] = Math.round(currencyConversion(taxBreakdown[i][1], selectedCurrency, calculatedCurrency))
          }
          setTaxBreakdown(convTaxBreakdown)
        }
      }
    }, [netIncome])

    React.useEffect(() => {
      if (itemizedFinances != null) {
        navigate("/dashboard", {state: {grossIncome: convertedGrossIncome, currency: calculatedCurrency, 
          netIncome: convertedNetIncome, modalData: modalData, itemizedFinances: itemizedFinances, 
          city: city, theState: state, country: country, profession: profession, taxBreakdown: taxBreakdown}})
      }
    }, [itemizedFinances])

    // Start Google Maps API Integration ---------------------------------------------------------------------

    const [libraries] = React.useState(['places'])
    const [searchResult, setSearchResult] = React.useState('')
      const { isLoaded } =  useLoadScript({
        googleMapsApiKey: 'AIzaSyBxEpP27Ml2lQQ0FKBuzLD6D2QCexGJAZ8',
        libraries
    });

    function onLoad(autocomplete) {
        setSearchResult(autocomplete);
      }
    
    function onPlaceChanged() {
      if (searchResult != null) {
        const place = searchResult.getPlace();
        let isUSAorCanada = false
        console.log(place)
        for(let i = 0; i < place.address_components.length; i++) {
          if(place.address_components[i].long_name == "Tokyo") {setCity("Tokyo")}
          if(place.address_components[i].long_name == "Seoul") {setCity("Seoul")}
          if (place.address_components[i].types[0] === "locality" || place.address_components[i].types[1] === "locality") {
            let cityCheck = removeAccent(place.address_components[i].long_name)
            setCity(cityCheck)
          } else if (place.address_components[i].types[0] === "country") {
            let countryCheck = place.address_components[i].long_name === "Türkiye" ? "Turkey": place.address_components[i].long_name
            countryCheck = place.address_components[i].long_name === "The Bahamas" ? "Bahamas": place.address_components[i].long_name
            countryCheck = place.address_components[i].long_name === "Czechia" ? "Czech Republic": place.address_components[i].long_name
            if (countryCheck === "United States" || countryCheck === "Canada") { isUSAorCanada = true }
            setCountry(countryCheck)
            setCurrency(TaxData.Sheet1[countryCheck]['Currency Label'])
            setSelectedCurrency(TaxData.Sheet1[countryCheck]['Currency Label'])      
          }
          if(isUSAorCanada) {
            for(let i = 0; i < place.address_components.length; i++) {
              if (place.address_components[i].types[0] === "administrative_area_level_1") {
                setState(place.address_components[i].long_name)
              }
            }
          }
        }
      } else {
        alert("Please enter text");
      }
    }

    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    // End Google Maps API Integration ---------------------------------------------------------------------

    // Google Cloud Job Autocomplete 
    //demografia-388321

    //Currency Dropdown Options
    const popularOptions = [
      'USD (United States Dollar)', 'EUR (Euro)', 'GBP (British Pound)'
    ];
    const otherCurrencies = [...new Set(Object.values(TaxData.Sheet1).map(country => country['Currency Label'] + " (" + country.Currency + ")" ).sort())]

    const options = popularOptions.concat(otherCurrencies)

    const reformedOptions = country == null ? "" : [currency + " (" + TaxData.Sheet1[country].Currency + ")"].concat(options)

    //Job Autofill Dropdown Options

    const reformedJobAuto = profAuto === null ? {}: Object.values(profAuto).map(job => job.suggestion)

    return (
        <div style={{backgroundImage: "linear-gradient(to right, #2F0849, #8E2856)"}} className="h-[100vh] w-[100vw] z-[0]">
            <div className="relative bg-white px-[3%] py-[10px]">
            <p className="text-[#2F0849] font-extrabold font-berkshire text-[30px]">Intrawage</p>
            </div>
            {openModal && <Modal calculatedCurrency={calculatedCurrency} city={city} 
              setItemizedFinances={setItemizedFinances} setModalData={setModalData}/>}
            <div className="flex relative h-[92vh]">
                <div className="relative lg:w-[50%] w-[100vw]">
                    <div className="relative lg:mx-[15%] mx-[8%] my-[10vh]">
                        <p className="text-white font-extrabold text-[5vh]"> Calculate your savings <br /> and interest.</p>
                        <form onSubmit={handleSubmit} className='mt-[0%]'>
                            <p className="text-white font-light pt-[2%] text-[2.5vh]">ENTER CITY*</p>
                            <Autocomplete onPlaceChanged={onPlaceChanged} onLoad = {onLoad}>
                                <input className="border-[5px] rounded-[30px] w-[85%] p-[1.5%] text-[2vh]" 
                                    placeholder="New York, New York" 
                                    type="text"
                                    name="city"
                                />
                            </Autocomplete>
                            <p className="relative text-white font-light pt-[2%] text-[2.5vh]">ENTER PROFESSION</p>
                            <input className="border-[5px] rounded-[30px] w-[85%] p-[1.5%] text-[2vh]" 
                                    placeholder="Financial Analyst" 
                                    type="text"
                                    onChange={handleProfessionChange}
                                    name="profession"
                                    value={profession}
                                    autoComplete="off"
                              />
                              {profAuto !== null && 
                                    <div className="absolute text-gray-600 rounded-[10px] bg-white font-bold ml-[10px] z-[1]">
                                      <p onClick={handleSelectedProfessionChange}  className="p-[8px] border-b-[1px]">{reformedJobAuto[0]}</p>
                                      <p onClick={handleSelectedProfessionChange}  className="p-[8px] border-b-[1px]">{reformedJobAuto[1]}</p>
                                      <p onClick={handleSelectedProfessionChange}  className="p-[8px] border-b-[1px]">{reformedJobAuto[2]}</p>
                                      <p onClick={handleSelectedProfessionChange}  className="p-[8px] border-b-[1px]">{reformedJobAuto[3]}</p>
                                      <p onClick={handleSelectedProfessionChange}  className="p-[8px] ">{reformedJobAuto[4]}</p>
                                    </div>
                                }
                            <p className="text-white font-light pt-[2%] text-[2.5vh]">ENTER INCOME</p>
                            <div className='flex relative w-[85%]'>
                               <input className="p-[2%] border-[5px] rounded-l-[30px] md:w-[80%] w-[70%] text-[2vh] border-r-0" 
                                  placeholder="100,000" 
                                  type="text"
                                  onChange={handleIncomeChange}
                                  name="householdIncome"
                                  value={householdIncome}
                                  autoComplete="off"
                               />
                                <Dropdown options={currency === "" ? options: reformedOptions} 
                                  className='border-[5px] rounded-r-[30px] md:w-[20%] w-[30%] font-bold pl-0 border-l-0' 
                                  menuClassName='text-[13px]'
                                  placeholderClassName=''
                                  onChange={handleCurrencyChange}
                                  placeholder="USD"
                                  value={selectedCurrency}
                                />
                            </div>
                            <div className='flex relative w-[85%] py-[1.5%]'>
                              <p className="text-white font-light py-[2%] pr-[4%] text-[2.5vh] ">CALCULATE IN:</p>
                              <Dropdown options={currency === "" ? options: reformedOptions} 
                                    className='rounded-[30px] md:w-[20%] w-[35%] my-[0%] font-bold p-[5px]' 
                                    menuClassName='text-[13px]'
                                    onChange={handleCalcCurrencyChange}
                                    placeholder="USD"
                                    value={calculatedCurrency}
                              />
                            </div>
                            <button disabled={loading} className="relative text-white font-bold border-[2px] rounded-[30px] px-[3.5%] py-[2%] mt-[10px]">Submit</button>
                            <div className='text-white text-[14px]'>
                              {/* {rent != null && livingExpenses != null && <>
                                  <p>1 Bedroom Aparment in City Center: {rent * 12} {calculatedCurrency} </p>
                                  <p>Estimated Expenses: {livingExpenses * 12} {calculatedCurrency}</p>
                                  </>} */}
                              {country != null && householdIncome != null && exchangeRate != null && <IncomeTaxCalc 
                                  income={householdIncome} country={country} currency={currency} state={state}
                                  selectedCurrency={selectedCurrency} currencyConversion={currencyConversion}
                                  setNetIncome={setNetIncome} netIncome={netIncome} setTaxBreakdown={setTaxBreakdown}
                              />}
                              {convertedNetIncome != null 
                                && <p>Income after taxes: {convertedNetIncome} {calculatedCurrency} (Net Income)</p>}
                            </div>
                        </form>
                    </div>
                </div>
                <div className="relative lg:mx-[5%] lg:w-[40%] justify-end bg-skyscrapers bg-splash-pattern bg-clip-border bg-no-repeat bg-right"> 
                </div>
            </div>
        </div>
    );
}

export default HomePage;