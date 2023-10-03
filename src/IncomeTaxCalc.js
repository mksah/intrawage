import TaxData from './data/International Income Tax Calculator.json'
import React from 'react';
import axios from 'axios';
function IncomeTaxCalc(props) {
    const income = props.income
    const country = props.country
    const state = props.state
    const currency = props.currency
    const selectedCurrency = props.selectedCurrency
    const exchangeRate = props.exchangeRate
    // const [numbeo, setNumbeo] = React.useState(null)   
    const countryCode = TaxData.Sheet1[country]['Country Code']
    const [netIncome, setNetIncome] = React.useState(null)
    const [taxBreakdown, setTaxBreakdown] = React.useState(null)
    const [stateTax, setStateTax] = React.useState(null)
    React.useEffect(() => {
        async function getIt() {
            await axios.post ('http://localhost:8000/taxcalc', {countryCode, income, selectedCurrency, state:"null"})
                .then(res => {setTaxBreakdown(Object.entries(res.data)); console.log(JSON.stringify(res.data))})
            if (state != null) {
                await axios.post ('http://localhost:8000/taxcalc', {countryCode, income, selectedCurrency, state})
                .then(res => {setTaxBreakdown(prevTaxBreakdown => {
                    return [...prevTaxBreakdown, [`Personal Income Tax - ${state}`, res.data == "" ? "USD 0":res.data.replace(/[^\d.-]/g,'')]]                  
                }); setStateTax(res.data.replace(/[^\d.-]/g,'')); console.log(res.data.replace(/[^\d.-]/g,''))})
            }
        }
        getIt()
      }, [])
      React.useEffect(() => {
        if (taxBreakdown != null && taxBreakdown != "") {
            console.log("Normale")
            if (state == null) {
                props.setNetIncome(taxBreakdown[0][1].replace(/[^\d.-]/g,''))
                console.log(taxBreakdown[0][1].replace(/[^\d.-]/g,''))
                props.setTaxBreakdown(taxBreakdown)
            } else if (state != null) {
                if (stateTax != null && stateTax != "error") {
                    props.setNetIncome(taxBreakdown[0][1].replace(/[^\d.-]/g,'') - stateTax)
                    console.log(taxBreakdown[0][1].replace(/[^\d.-]/g,''))
                    props.setTaxBreakdown(taxBreakdown)
                } else if (stateTax == "error"){
                    props.setNetIncome(taxBreakdown[0][1].replace(/[^\d.-]/g,''))
                    console.log(taxBreakdown[0][1].replace(/[^\d.-]/g,''))
                    props.setTaxBreakdown(taxBreakdown)
                }
            } 
        } else if(taxBreakdown == "") {
            let result = conventionalTaxCalc()
            props.setNetIncome(result)
            console.log("Conventional Tax Calc:" + result)
            // setNetIncome(result)
        }
        console.log("end!")
      }, [netIncome, stateTax, taxBreakdown])

    function conventionalTaxCalc() {
        let currIncome = props.currencyConversion(income, selectedCurrency, currency)
        let bracketLevel = 1
        let display = ""
        let currTaxRate = 0
        let convertedIncome = currIncome

        
        while(currIncome > 0) {
            let currBound = TaxData.Sheet1[country][`Bracket ${bracketLevel} (Upper Bound)`]
            let currRate = TaxData.Sheet1[country][`Rate ${bracketLevel}`]
            let currBracket = currBound
            if (bracketLevel != 1) {
                currBracket = currBound - TaxData.Sheet1[country][`Bracket ${bracketLevel - 1} (Upper Bound)`]
            }
            display += "Bracket: " + currBracket + " Rate:" + currRate + " "
            if (currBound == 'x' || currIncome < currBracket) {
                currTaxRate += (currIncome * (currRate / 100))
                currIncome = 0;
            } else {
                currTaxRate += (currBracket * (currRate / 100))
                currIncome -= currBracket
            }
            bracketLevel++;
            display += " Tax Rate: " + currTaxRate + " Leftover Income:" + currIncome + "   ||||   ";
        }

        let convertedTaxRate = props.currencyConversion(currTaxRate, currency, selectedCurrency);

        return Math.round(income - convertedTaxRate)
    }
    
    return (
      <div>
        {/* <p>{display}</p> */}
        {/* <p>Tax Calculation in {currency}: {currency} {Math.round(convertedIncome)} - {currency} {Math.round(currTaxRate)} = {currency} {Math.round(convertedIncome - currTaxRate)}</p>
        {currency != selectedCurrency && <p>Tax Calculation in {selectedCurrency}: {selectedCurrency} {Math.round(income)} - {selectedCurrency} {Math.round(convertedTaxRate)} = {selectedCurrency} {Math.round(income - convertedTaxRate)}</p>} */}
        {netIncome !== null && netIncome != "error" && (state === null || stateTax === "error") && <p>Net Income after taxes: {netIncome} {selectedCurrency} </p>}
        {netIncome !== null && netIncome != "error" && stateTax !== null && stateTax != "error" && <p>Net Income after taxes: {netIncome} {selectedCurrency}, State Taxes of: {stateTax} </p>}
      </div>
    );
  }
  export default IncomeTaxCalc;