$( document ).ready(function() {

    var total = $('#getQuotaInfo').data('total');
    var totalPercent = $('#getQuotaInfo').data('totalpercent');
    var files = $('#getQuotaInfo').data('files');
    var filesPercent = $('#getQuotaInfo').data('filespercent');
    var trash = $('#getQuotaInfo').data('trash');
    var trashPercent = $('#getQuotaInfo').data('trashpercent');
    var version = $('#getQuotaInfo').data('versions');
    var versionPercent = $('#getQuotaInfo').data('versionpercent');
    var free = $('#getQuotaInfo').data('free');
    var freePercent = $('#getQuotaInfo').data('freepercent');
    var used = $('#getQuotaInfo').data('used');

    var dataset = [
        { name: t('settings','Files used space')+": "+files, percent: filesPercent ,used:files},
        { name: t('settings','Trashbin used space')+": " + trash, percent: trashPercent ,used:trash},
        { name: t('settings','Version control files used space')+": " + version, percent: versionPercent,used:version},
        { name: t('settings','Free space')+": " + free, percent: freePercent,used:free }
    ];

    var pie=d3.layout.pie()
            .value(function(d){return d.percent})
            .sort(null)
            .padAngle(0);

    var w=600,h=300;

    var outerRadius=w/4;
    var innerRadius=100;

    var color = d3.scale.category10();
    //var color = d3.scale.ordinal()
    //.range(['#41B787', '#6352B9', '#B65480', '#D5735A', '#D7D9DA']);

    var arc=d3.svg.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);

    var svg=d3.select("#chart")
            .append("svg")
            .attr({
                width:w,
                height:h,
                class:'shadow'
            }).append('g')
            .attr({
                transform:'translate('+w/4+','+h/2+')'
            });
    var tooltip = d3.select("body")
	.append("div")
        .style("width","100px")
        .style("height","25px")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("border-radius", "6px") 
	.style("text-align", "center")
	.style("background-color", "black")
	.style("color", "#fff")
	.style("visibility", "hidden")
	.text("a simple tooltip"); 
    var path=svg.selectAll('path')
            .data(pie(dataset))
            .enter()
            .append('path')
            .attr({
                d:arc,
                fill:function(d,i){
                    return color(d.data.name);
                }
            });
    path.on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d.data.used);})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden");});
    path.transition()
            .duration(1000)
            .attrTween('d', function(d) {
                var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

    var restOfTheData=function(){

        var text=svg.selectAll('text')
                .data(pie(dataset))
                .enter()
                .append("text")
                .transition()
                .duration(200)
                .attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".4em")
                .attr("text-anchor", "middle")
                .text(function(d){
                    if (d.data.percent != 0){
                    return d.data.percent+"%";}
                })
                .style({
                    fill:'#fff',
                    'font-size':'12px'
                });
        svg.append("text")
            .attr("dy", "0.5em")
            .attr("y","-10")
            .style("text-anchor", "middle")
            .attr("class", "inner-circle")
            .attr("fill", "#36454f")
            .text(function(d) { return t('settings', 'Total space')+": " + total; });
        svg.append("text")
           .attr("dy", "2.0em")
           .style("text-anchor", "middle")
           .attr("y","-10")
           .attr("class", "inner-circle")
           .attr("fill", "#36454f")
           .text(function(d) { return t('settings', 'Used space')+": " + used; });
 
        var legendRectSize=20;
        var legendSpacing=7;
        var legendHeight=legendRectSize+legendSpacing;
        var legend=svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr({
                    class:'legend',
                    transform:function(d,i){
                        //Just a calculation for x & y position
                        return 'translate(180,' + ((i*legendHeight)-65) + ')';
                    }
                });
        legend.append('rect')
                .attr({
                    width:legendRectSize,
                    height:legendRectSize,
                    rx:20,
                    ry:20
                })
                .style({
                    fill:color,
                    stroke:color
                });

        legend.append('text')
                .attr({
                    x:30,
                    y:15
                })
                .text(function(d){
                    return d;
                }).style({
                    fill:'#929DAF',
                    'font-size':'16px'
                });
    };

    setTimeout(restOfTheData,1000);
});

