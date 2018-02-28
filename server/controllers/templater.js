var Templater = (function(){

    //var templateHTML, compiledHTML, pieces=[];

    function Templater(html, attributes){
        //One single line and one space only
        html = html.replace(/(?:\r\n|\r|\n|\t|\n\t| \n\t)/g, '');
        html = html.replace(/\s{2,}/g, ' ');

        this.pieces = null;
        this.evalFn = null;
        this.templateHTML = html;

        if (html.indexOf('qs-repeat=') !== -1
            || html.indexOf('qs-show=') !== -1
            || html.indexOf('qs-if=') !== -1){
            this.evalFn = repeater(html);
        }else {
            this.pieces = parse(html);
        }
    }

    function parse(html){
        var pattern = /({{([^#^!^/].*?)}})/g;
        var pieces = [];
        while (s=pattern.exec(html)){
            pieces.push({what:s[0], item:s[0].replace("{{","").replace("}}","")});
        }
        return pieces;
    }

    function repeater(html){
        var htmlObj = document.createElement('div');
        htmlObj.innerHTML = html;
        var evalFn = [];

        var ifElms = htmlObj.querySelectorAll('[qs-if]');
        if (ifElms.length > 0){
            for (var i=0; i<ifElms.length;i++){
                var htmlItem = getHTMLString(ifElms[i]);
                var expression = (ifElms[i].attributes)? ifElms[i].attributes["qs-if"].value : null;
                evalFn.push({
                    'type':'qs-if',
                    'htmlItem': htmlItem,
                    'expression': expression
                });
            }
        }

        var repeatElms = htmlObj.querySelectorAll('[qs-repeat]');
        if (repeatElms.length > 0){
            for (var i=0; i<repeatElms.length;i++){
                var htmlItem = getHTMLString(repeatElms[i]);
                var expression = repeatElms[i].attributes["qs-repeat"].value.split(' '),
                    dimension = expression[expression.length-1],
                    loop = expression[0]+' '+'in'+' data["'+dimension+'"]';

                evalFn.push({
                    'type': 'qs-repeat',
                    'htmlItem': htmlItem,
                    'dimension': dimension,
                    'repeater': expression[0],
                    'loop': loop,
                    'repeatPieces': parse(htmlItem)
                });
            }
        }

        var showElms = htmlObj.querySelectorAll('[qs-show]');
        if (showElms.length > 0){
            for (var i=0; i<showElms.length;i++){
                var htmlItem = getHTMLString(showElms[i]);
                var expression = (showElms[i].attributes)? showElms[i].attributes["qs-show"].value : null;

                evalFn.push({
                    'type':'qs-show',
                    'htmlItem': htmlItem,
                    'expression': expression
                });
            }
        }

        var hideElms = htmlObj.querySelectorAll('[qs-hide]');
        if (hideElms.length > 0){
            for (var i=0; i<hideElms.length;i++){
                var htmlItem = getHTMLString(hideElms[i]);
                var expression = (hideElms[i].attributes)? hideElms[i].attributes["qs-hide"].value : null;

                evalFn.push({
                    'type':'qs-hide',
                    'htmlItem': htmlItem,
                    'expression': expression
                });
            }
        }

        var refElms = htmlObj.querySelectorAll('[qs-ref]');
        if (refElms.length > 0){
            for (var i=0; i<refElms.length;i++){
                var htmlItem = getHTMLString(refElms[i]);
                var expression = (refElms[i].attributes)? refElms[i].attributes["qs-ref"].value : null;

                evalFn.push({
                    'type':'qs-ref',
                    'htmlItem': htmlItem,
                    'expression': expression
                });
            }
        }

        htmlObj.innerHTML = null;

        return evalFn;
    }

    function getRepeatBlock(params, evalIterator, data, iteration){
        var that = this;
        var htmlString = params.htmlItem;
        for(var i=0;i<params.repeatPieces.length;i++){
            try{
                var what = params.repeatPieces[i].what;
                var fields = params.repeatPieces[i].item.split('.');
                var item = what;
                if (fields[0] == params.repeater){
                    fieldFormatter = fields[fields.length-1].split(":");
                    var df = fieldFormatter[1] || null;
                    item = evalIterator;
                    if (fields.length > 1){
                      var item = data;
                      for(var ii=1;ii<fields.length;ii++){
                        prop = fields[ii];
                        if(prop.indexOf(":")){
                          prop = prop.split(":")[0];
                        }
                        if(item){
                          item = item[prop];
                        }
                      }

                      //item = data[prop];
                    }
                    if(item){
                      if(df){
                        //currently only supports date or time
                        try{
                          var date = new Date(parseInt(item));
                          if(df=="Date"){
                            var day = date.getDate();
                            var monthIndex = date.getMonth();
                            var year = date.getFullYear();
                            var output = day + ' ' + monthNames[monthIndex] + ' ' + year
                          }
                          if(df=="Time"){
                            var output = date.getHours() + ':' + (date.getMinutes()<10?'0':'')+date.getMinutes();
                          }
                          htmlString = htmlString.replace(what, output);
                        }
                        catch(err){

                        }
                      }
                      else{
                        //must be text
                        htmlString = htmlString.replace(what, highlightText(item, this.terms));
                      }
                    }
                }
                else if(fields[0]=="$"){
                  item = parseInt(evalIterator)+1;
                  if(item){
                      htmlString = htmlString.replace(what, item);
                  }
                }

            }
            catch(err){
              console.error("templater.js - getRepeatBlock - try/catch")
              console.error(htmlString);
            }
        }

        var myEval = function(expr){
            var rootExpr;
            if(expr.indexOf("(")==-1){
              rootExpr = expr.split(".");
              if(rootExpr.length>1){
                rootExpr.splice(0,1);
              }
              rootExpr = rootExpr.join(".");
            }
            var s = true;
            try{
              if(expr.indexOf("(")!=-1){
                eval('s='+expr);
              }
              else{
                eval('var o=data; if (that.data.'+rootExpr+' || data.'+rootExpr+' || that.data.'+expr+' || data.'+expr+' || '+expr+') { s=true; } else { s=false; }');
              }
            }
            catch(err){
              s = false;
            }
            finally{

            }
            return s;
        };

        var fn = repeater(htmlString);
        var fnAlt = repeater(htmlString);
        //hide/remove any items for the show/if conditions
        for (var k=0; k<fn.length;k++){  //then we can run again and update the if/show blocks
          //this is a test.
          //if 2 of these exist in the same markup then only the first 1 runs
          //this is because it changes the html and subsequently the replace doesn't work
          //now we're keeping k at 0 and re-evaluating fn on each iteration
          //in theory the array should reduce each time until we're done
          if (fn[k].type === 'qs-if'){
              if (myEval(fn[k].expression) === false){
                  //Remove dom element from template
                  fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
                  htmlString = htmlString.replace(fn[k]['htmlItem'], '');
              }
              fn = repeater(htmlString);
          }
          else  if (fn[k].type === 'qs-show'){
            var show = (myEval(fn[k].expression));
            if(show === true){
              fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
              if(htmlString.indexOf(fn[k]['htmlItem'])!=-1){
                var str = fn[k]['htmlItem'].replace('qs-show', 'style="display:inherit;" qs-done');
                htmlString = htmlString.replace(fn[k]['htmlItem'], str);
              }
              fn = repeater(htmlString);
            }
          }
          else  if (fn[k].type === 'qs-hide'){
              var show = (myEval(fn[k].expression));
              if(show === true){
                fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
                if(htmlString.indexOf(fn[k]['htmlItem'])!=-1){
                  var str = fn[k]['htmlItem'].replace('qs-hide', 'style="display:none;" qs-done');
                  htmlString = htmlString.replace(fn[k]['htmlItem'], str);
                }
                fn = repeater(htmlString);
              }
          }
          else  if (fn[k].type === 'qs-ref'){
              var loc = window.location.hash.split("?")[0];
              loc += "?" + fn[k].expression;
              loc = loc.replace(/%22/g, "");
              //var show = (myEval(fn[k].expression) === true)? 'none' : 'block';
              fn[k]['htmlItem'] = fn[k]['htmlItem'].replace(/&amp;/g, '&');
              if(htmlString.indexOf(fn[k]['htmlItem'])!=-1){
                var str = fn[k]['htmlItem'].replace('qs-ref', 'href='+loc+' qs-done');
                htmlString = htmlString.replace(fn[k]['htmlItem'], str);
              }
              fn = repeater(htmlString);
          }
          else{
            //break;
          }
        }

        //check to see if we need to repeat again
        if (fnAlt && fnAlt.length > iteration){
          for (var j=iteration; j<fnAlt.length; j++){
            //on the first pass we're just looking for repeat blocks
            if (fnAlt[j].type === 'qs-repeat'){
                htmlString = repeat.call(this, htmlString, fnAlt[j]['htmlItem'], fnAlt[j], data[fnAlt[j]['dimension']], j);
                break;  //we break out of the loop after the first execution. The repeater block should handle embedded repeats
            }
          }
        }


        return htmlString;
    }

    Templater.prototype = Object.create(Object.prototype, {
        getHTML:{
            value: function(data){
              var that = this;
                this.compiledHTML = this.templateHTML;
                this.data = data;
                this.terms = data.terms;
                var myEval = function(expr){
                  var rootExpr = expr.split(".");
                    if(rootExpr.length>1){
                      rootExpr.splice(0,1);
                    }
                    rootExpr = rootExpr.join(".");
                    var s = true;
                    try{
                      eval('var o=data; if (that.data.'+rootExpr+' || data.'+rootExpr+' || that.data.'+expr+' || data.'+expr+' || '+expr+') { s=true; } else { s=false; }');
                    }
                    catch(err){
                      s = false;
                    }
                    finally{
                    }
                    return s;
                };

                var fn = this.evalFn;
                if (fn && fn.length > 0){
                    for (var i=0; i<fn.length; i++){
                      //on the first pass we're just looking for repeat blocks
                      if (fn[i].type === 'qs-repeat'){
                          this.compiledHTML = repeat.call(this, this.compiledHTML, fn[i]['htmlItem'], fn[i], data[fn[i]['dimension']], i);
                          break;  //we break out of the loop after the first execution. The repeater block should handle embedded repeats
                      }
                    }
                    //DUE TO CONFLICTS IN REPEATED COMPONENTS 'QS-IF' IS CURRENTLY NOT EXECUTED AT A PARENT LEVEL
                    for (var i=0; i<fn.length; i++){  //then we can run again and update the if/show blocks
                      // if (fn[i].type === 'qs-if'){
                      //     if (myEval(fn[i].expression) === false){
                      //         //Remove dom element from template
                      //         fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                      //         this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], '');
                      //     }
                      //}else
                      if (fn[i].type === 'qs-show'){
                          var show = (myEval(fn[i].expression) === true)? 'inherit' : 'none';
                          fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                          if(this.compiledHTML.indexOf(fn[i]['htmlItem'])!=-1){
                            var str = fn[i]['htmlItem'].replace('qs-show', 'style="display:'+show+'" qs-done');
                            this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], str);
                          }
                      }
                      else  if (fn[i].type === 'qs-hide'){
                          var show = (myEval(fn[i].expression) === true)? 'none' : 'inherit';
                          fn[i]['htmlItem'] = fn[i]['htmlItem'].replace(/&amp;/g, '&');
                          if(this.compiledHTML.indexOf(fn[i]['htmlItem'])!=-1){
                            var str = fn[i]['htmlItem'].replace('qs-hide', 'style="display:'+show+'" qs-done');
                            this.compiledHTML = this.compiledHTML.replace(fn[i]['htmlItem'], str);
                          }
                      }
                    }
                }
                //if (!this.pieces){
                    this.pieces = parse(this.compiledHTML);
                //}

                for(var i=0;i<this.pieces.length;i++){
                    try{
                      //check to see if the piece refers to a child property
                      var props = this.pieces[i].item.split(".");
                      var result = data;
                      for (var p in props){
                        result = result[props[p]];
                      }
                      if(result){
                        this.compiledHTML = this.compiledHTML.replace(this.pieces[i].what, result);
                      }
                    }
                    catch(err){
                      console.error("templater.js - getHTML - try/catch")
                      console.error(data.toString());
                    }
                }
                return this.compiledHTML;
            }
        }

    });

    function repeat(compiledHTML, oriString, fn, data, iteration){
      iteration++;
      var repeatBlokHTML = '';
      var oriString = fn['htmlItem'];
      if(compiledHTML.indexOf(oriString) !== -1){
          for (var t in data){
              repeatBlokHTML += getRepeatBlock.call(this, fn, t, data[t], iteration);
          }
          return compiledHTML.replace(oriString, repeatBlokHTML);
      }
      return "";
    }

    function getHTMLString(node){
        if(!node || !node.tagName) return '';
        if(node.outerHTML) return node.outerHTML;

        var wrapper = document.createElement('div');
        wrapper.appendChild(node.cloneNode(true));
        var strHTML = wrapper.innerHTML;
        wrapper.innerHTML = null;
        return strHTML;
    }

    function highlightText(text, terms){
      //NOTE THIS FUNCTION ALSO STRIPS OUT ANY HTML TAGS
      text = text.replace(/<\/?[^>]+(>|$)/g, "");
      if(terms){
        for (var i=0;i<terms.length;i++){
          text = text.replace(new RegExp(terms[i], "i"), "<span class='highlight"+i+"'>"+terms[i]+"</span>")
        }
      }
      return text;
    };

    function withinRange(page, current, max, range){
      var minPage, maxPage;
      if(max==1){
        return false;
      }
      else if(current <= 2){
        minPage = 1;
        maxPage = range
      }
      else if (current >= max - 2) {
        minPage = max - range;
        maxPage = max;
      }
      else{
        minPage = current - 2;
        maxPage = current + 2;
      }
      return (page >= minPage && page <= maxPage);
    };

    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];

    return Templater;

}());


module.exports = Templater;
