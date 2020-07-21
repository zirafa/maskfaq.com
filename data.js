// Wait for the document to load before running the script 
(function ($) {
/**
 * Given csv data, generate HTML table
 */
function generateHtmlTable(data) {
  var html = '<table id="materials-data">';
  if(typeof(data[0]) === 'undefined') {
    return null;
  } else {
    $.each(data, function( index, row ) {
      //bind header
      if(index == 0) {
        html += '<thead>';
        html += '<tr>';
        $.each(row, function( index, colData ) {
            // Only show columns 0-5
            if (index > 5) {
              html += '<th style="display:none;">';
            }
            else {
              html += '<th>';
            }
            html += colData;
            html += '</th>';
        });
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
      } else {
        html += '<tr>';
        $.each(row, function( index, colData ) {
            // Only show columns 0-5
            if (index > 5) {
              html += '<td style="display:none;">';
            }
            else {
              html += '<td>';
            }
            html += colData;
            html += '</td>';

        });
        html += '</tr>';
      }
    });
    html += '</tbody>';
    html += '</table>';
    $('#materials-table').append(html);
  }
}	

/**
 * After table is loaded, add sort, search, and graphs
 */
function tableModifiers() { 
  // Sort & color code table
  var materialsData = document.getElementById("materials-data");
  for (var i = 0, row; row = materialsData.rows[i]; i++) {
    for (var j = 0, col; col = row.cells[j]; j++) {
      //iterate through columns., col=5 is efficiency
      // Breathability column. If > 15 flag with red color
      if (j==3 && col.innerHTML > 15) {
        col.innerHTML = '<span style="color:#FF0000">' + col.innerHTML + '</span>';
      }
      // Efficiency column. If greater than 50 flag with green
      if (j==5 && col.innerHTML > 50) {
        col.innerHTML = '<span style="color:#34a853">' + col.innerHTML + '</span>';
      }
    }  
  }  
  new Tablesort(materialsData);
    
  // Search & Filter rows of table
  $("#filter-table").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#materials-data tbody tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
  
  // Scatter plot
  var trace1 = {
    x: [],
    y: [],
    mode: 'markers',
    type: 'scatter',
    'name': '',
    text: [],
    hovertemplate: '<i>Material</i>: %{text}' + '<br>'+
                   '<i>Filtration:</i> %{x}' + '%<br>' +
                   '<i>Resistance (mmH20):</i> %{y}',  
    marker: {
      size: [],
      color:[],
      symbol:[],
      colorscale: [
        ['0.0', 'rgb(230, 74, 25)'],    
        ['0.5', 'rgb(255, 193, 7)'],    
        ['1.0', 'rgb(76, 175, 80)']    
      ]
      }
  };
  var bar1 = {
    x: [],
    y: [],
    type: 'bar',
    text: [],
    color:[],
    colorscale: [
      ['0', 'rgb(255, 193, 7)'],      
      ['1.0', 'rgb(76, 175, 80)']   
    ],
    hovertemplate: '<i>Material</i>: %{x}' + '<br>'+
                   '<i>Filtration:</i> %{y}' + '%<br>' +
                   '<i>Resistance (mmH20):</i> %{text}',     
    marker: {
      color: 'rgb(76, 175, 80)'
    }
  };
  // Scrape data from table for scatter plot and bar graph
  $('table tbody tr').each(function(index, tr) { 
    var name = tr.cells[0].innerText;
    var layerCount = Number(tr.cells[1].innerText) + 3;
    var resistance = tr.cells[3].innerText;
    var filtration = tr.cells[5].innerText;
    var group = tr.cells[6].innerText;
    // Hide outliers
    if (resistance < 50) { 
      trace1.y.push(resistance);
      trace1.x.push(filtration);
      trace1.text.push(name);
      trace1.marker.color.push(filtration-resistance);
      //var size = 12 + layerCount/1.25;
      var size = 12;
      var shape = "circle";
      if (group == 'N95') {
        shape = "star";
        size = 16;
      }
      /*
      switch (group) {
        case "N95":
          shape = "star";
          break;
        case 'Cotton':
          shape = "square";
          break;
        case 'Filti':
          shape = "diamond";
          break;
        default:
          shape = "circle";
      }
      */
      trace1.marker.size.push(parseInt(size));
      trace1.marker.symbol.push(shape);
      
      if (filtration > 50 && resistance > 1 && resistance < 15) {
        bar1.x.unshift(name);
        bar1.y.unshift(filtration);
        bar1.text.unshift(resistance);
        bar1.color.unshift(filtration-resistance)
      }

    }
  });
    
  var data = [trace1];
  
  var layout = {
    xaxis: {
      range: [ 0, 100]
    },
    yaxis: {
      range: [0, 50]
    },
    hovermode: 'closest',
    title:'Mask Filtration vs. Breathing Resistance',
    xaxis:{hoverformat: '.2f', showspikes:true, spikethickness:1, spikedash:'dot', title: 'Filtration Efficiency (%)'},
    yaxis:{hoverformat: '.2f', showspikes:true, spikethickness:1, spikedash:'dot', title: 'Resistance (mmH20)'},
  };
  
  Plotly.newPlot('scatter-plot', data, layout);    

  // Bar chart of efficiencies where resistance is between 1 and 15
  var barData = [bar1];
  
  var barLayout = {
    title: 'Filter efficiency of most breathable materials',
    showlegend: false,
    margin: {
      b:125
    },
    xaxis: {
    }
  };
 
  Plotly.newPlot('bar-chart', barData, barLayout);

}



/**
 * Create table using CSV data 
 */
var data;
$.ajax({
  type: "GET",  
  url: "https://zirafa.github.io/maskfaq.com/data.csv",
  dataType: "text",       
  success: function(response)  
  {
    data = $.csv.toArrays(response);
    generateHtmlTable(data);
    tableModifiers();
  } 
});  
  
})(jQuery);
