import { useLocation } from "react-router-dom";
import React from 'react';
import DataTable from "react-data-table-component";

function Dashboard() {
  const {state} = useLocation();
  const { grossIncome, currency, itemizedFinances, netIncome, modalData, city, theState, country, profession, taxBreakdown} = state;
  const [savings, setSavings] = React.useState(null)
  const [rent, setRent] = React.useState(null)
  const [modifiedItemizedFinances, setModifiedItemizedFinances] = React.useState(null)
  // let netIncome = taxBreakdown[0][1].replace(/[^\d.-]/g,'')
  React.useEffect(() => {
    console.log(itemizedFinances)
    if (itemizedFinances != null && Object.entries(itemizedFinances).length > 0 ) {
      let originalExpenses = parseInt(itemizedFinances[["The overall estimate of monthly spending*"]])
      let originalRent = parseInt(itemizedFinances[["Rent"]])
      let rent = originalRent
      if (modalData.roommates) {
        rent = rent / 3;
      }
      if (modalData.sharedRoom) {
        rent = rent / 2;
      }
      let modifiedExpenses = originalExpenses - originalRent + rent
      setRent(rent)
      setSavings(netIncome - (modifiedExpenses * 12))
  
      let test = Object.entries(itemizedFinances)
      for (let i = 0; i < test.length; i++) {
        test[i][1] = (parseInt(test[i][1]) * 12)
        test[i][2] = test[i][1] / 12
        if(test[i][0] == "Rent") {
          if (modalData.roommates) {
            test[i][0] += " w/ roommates"
          }
          if (modalData.sharedRoom) {
            test[i][0] += ", shared room"
          }
          test[i][1] = rent * 12 
          test[i][2] = Math.round(rent)
        } else if (test[i][0] == "The overall estimate of monthly spending*") {
          test[i][0] = "TOTAL"
          test[i][1] = (modifiedExpenses * 12)
          test[i][2] = Math.round(modifiedExpenses)
        }
        // console.log(test[i][1])
      }
      delete test[2]
      delete test[11]
      console.log(test)
      setModifiedItemizedFinances(test)
    } else {
      setSavings("N/A")
    }
  }, [])
  
  const customStyles = {
    rows: {
      style: {
          fontWeight: 'semibold', 
          fontSize: '15px'
      },
    },
    headCells: {
      style: {
          fontWeight: 'bold', 
          fontSize: '11px'
      },
    }
};

  return (
    <div style={{backgroundImage: "linear-gradient(to right, #2F0849, #8E2856)"}} className=" w-[100%] min-h-[100vh] h-full z-[0]">
    <div className="relative bg-white px-[3%] py-[10px]">
      <p className="text-[#2F0849] font-extrabold font-berkshire text-[30px]"> Intrawage </p>
    </div>
    <p className="mt-[2%] mx-[11%] sm:text-[2.3vw] text-[25px] font-bold text-white"><b className="text-white font-extrabold font-berkshire">Intrawage &#x2022; </b> {profession} <b className="font-light">in</b> {city}, {country}</p>
    <div className="sm:flex mx-[10%] mt-[1.5%] h-full">
      <div className="bg-white mx-[1%] sm:w-[25vw] sm:h-[13vw] sm:p-[1.5%] p-[3%] sm:mb-[0%] mb-[5%] leading-tight">
        <p className=" sm:text-[1.7vw] font-bold">Gross Income</p>
        <p className="italic sm:text-[1vw]">Est. Salary</p>
        <p className="py-[0%] sm:text-[4.5vw] text-[45px] font-semibold">{grossIncome}</p>
        <p className="sm:text-[1.7vw] text-[18px] leading-none">{currency}</p>
      </div>
      <div className="bg-white mx-[1%] sm:w-[25vw] sm:h-[13vw] sm:p-[1.5%] p-[3%] sm:mb-[0%] mb-[5%] leading-tight">
        <p className="sm:text-[1.7vw] font-bold">Net Income</p>
        <p className="italic sm:text-[1vw]">Est. Salary after Taxes</p>
        <p className="py-[0%] sm:text-[4.5vw] text-[45px] font-semibold">{netIncome}</p>
        <p className="sm:text-[1.7vw] text-[18px] leading-none">{currency}</p>
      </div>
      <div className="bg-white mx-[1%] sm:w-[25vw] sm:h-[13vw] sm:p-[1%] p-[3%] sm:mb-[0%] mb-[5%] leading-tight border-4 border-slate-400" >
      <p className="sm:text-[1.7vw] font-bold">Savings</p>
        <p className=" italic sm:text-[1vw]">Est. Salary after Taxes and Expenses</p>
        {savings != null && <p className="py-[0%] sm:text-[4.5vw] text-[45px] font-semibold">{savings}</p>}
        <p className="sm:text-[1.7vw] text-[18px] leading-none">{currency}</p>
      </div>
    </div>
    <div className="sm:flex mt-[1.5%] mx-[10%]">
      <div className="bg-white mb-[4%] mx-[1%] sm:w-[60%] h-full">
        <div className="flex justify-between">
        <p className="mt-[4%] ml-[5%] sm:text-[1.7vw] font-bold ">Est. Expenses Breakdown</p>
        {modifiedItemizedFinances != null && <p className="mt-[4%] mr-[5%] sm:text-[1.7vw] font-semibold ">Total: <b className="font-light">{modifiedItemizedFinances[13][1]} {currency}</b></p>}
        </div>
        <div className="mx-[5%] my-[2%]">
        {modifiedItemizedFinances != null && <DataTable
            customStyles={customStyles}
            // conditionalRowStyles={conditionalStyles}
            columns={
              [
                {
                  name: "CATEGORY",
                  id: "category",
                  selector: row => row[0],
                  sortable: false,
                  grow: 3.5,
                  wrap: true
                },
                {
                  name: "AMOUNT (" + currency + ")",
                  id: "amount",
                  selector: row => row[1],
                  sortable: true,
                  grow: 2
                },
                {
                  name: "AMOUNT, MONTHLY",
                  id: "amount2",
                  selector: row => row[2],
                  sortable: true,
                  grow: 2
                },
              ]
            }
            data={modifiedItemizedFinances} //fill attendees data here
            defaultSortFieldId={"amount"}
            defaultSortAsc={false}
            // sortIcon={<SortIcon />}
            striped
          /> }
          {modifiedItemizedFinances == null && <p>Expenses information is unavailable for {city}, {country}. Input bigger cities nearby for better results</p>}
          </div>
        {/* {Object.entries(itemizedFinances).map(([key, value]) => {
          return <p className="ml-[4%] mt-[0%] text-[18px]">{key}: {value}</p>
        })} */}
      </div>
      <div className="bg-white mb-[6%] pb-[2%] mx-[1%] sm:w-[40%] h-full">
        <div className="flex justify-between">
          <p className="mt-[4%] ml-[5%] sm:text-[1.7vw] font-bold ">Est. Tax</p>
          <p className="mt-[4%] mr-[5%] sm:text-[1.7vw] font-semibold ">Total: <b className="font-light">{grossIncome - netIncome} {currency}</b></p>
        </div>
        <div className="mx-[5%] my-[2%]">
          {taxBreakdown != null && <DataTable
              customStyles={customStyles}
              // conditionalRowStyles={conditionalStyles}
              columns={
                [
                  {
                    name: "SECTION",
                    id: "section",
                    selector: row => row[0],
                    sortable: false,
                    grow: 2,
                    wrap: true
                  },
                  {
                    name: "AMOUNT (" + currency + ")",
                    id: "amount",
                    selector: row => row[1],
                    sortable: true,
                    grow: 1
                  }
                ]
              }
              data={ taxBreakdown.filter(value => value[0] != "Total")} //fill attendees data here
              defaultSortFieldId={"amount"}
              defaultSortAsc={false}
              // sortIcon={<SortIcon />}
              striped
            /> }
            {taxBreakdown == null && <p>Itemized Tax Breakdown is unavailable for {country}. An estimated tax value is provided</p>}
        </div>
      </div>
    </div>
    <div className="bg-black pb-[0.1%] h-full"></div>
    </div>
  );
}

export default Dashboard;