app.directive("searchResults", ["$resource", "$state", "$stateParams", "userManager", "resultHandler", "publisher", function($resource, $state, $stateParams, userManager, resultHandler, publisher){
  return {
    restrict: "E",
    replace: true,
    scope: {

    },
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
      $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/'+$attrs.config+'.json', success: function(json){
        $scope.config = JSON.parse(json);
        $scope.template = $scope.config.template;
        $scope.fields = $scope.config.fields;
        $scope.qFields;
        $scope.sortOptions = $scope.config.sorting;
        $scope.sort = $scope.sortOptions[$scope.config.defaultSort];
        $scope.elemId = $attrs.id;
        var Entity;
        if($scope.config.entity){
          Entity = $resource("/api/" + $scope.config.entity + "/:id", {id: "@id"});
        }

        $scope.highlightText = function(text){
          if(searchExchange.state && searchExchange.state.searchText){
            var terms = searchExchange.state.searchText.split(" ");
            for (var i=0;i<terms.length;i++){
              text = text.replace(new RegExp(terms[i], "i"), "<span class='highlight"+i+"'>"+terms[i]+"</span>")
            }
            return text;
          }
          else{
            return text;
          }
        };

        $scope.loading = true;

        $scope.items = [];

        $scope.hidden = [];

        $scope.flagged = {};

        $scope.stars = new Array(5);

        $scope.postponed;
        $scope.resultsTemplateCallback;
        $scope.pagingTemplateCallback;

        $scope.pageTop = 0;
        $scope.pageBottom = $scope.config.pagesize;
        $scope.currentPage = 1;
        $scope.pages = [];

        $scope.broadcast = function(fnName, params){
          $scope.$root.$broadcast(fnName, params);
        };

        $scope.getHidden = function(){
          if(Entity){
            Entity.get({id: "hidden"}, {
              limit: 100  //if we have more than 100 hidden items we have some housekeeping to do
            }, function(result){
              if(resultHandler.process(result)){
                $scope.hidden = result.data;
              }
            });
          }
        };

        $scope.getFlagged = function(){
          if(Entity){
            Entity.get({id: "flagged"}, {
              limit: 100  //if we have more than 100 flagged items we have some housekeeping to do
            }, function(result){
              if(resultHandler.process(result)){
                //$scope.flagged = result.data;
                if(result.data){
                  for(var i=0;i<result.data.length;i++){
                    $scope.flagged[result.data[i].entityId] = true;
                  }
                }
              }
            });
          }
        };

        $scope.getHidden();
        $scope.getFlagged();

        $scope.isHidden = function(id){
          for(var i=0;i<$scope.hidden.length;i++){
            if($scope.hidden[i]._id == id){
              return true;
            }
          }
          return false;
        };

        $scope.isFlagged = function(id){
          if($scope.flagged){
            for(var i=0;i<$scope.flagged.length;i++){
              if($scope.flagged[i].entityId == id){
                return true;
              }
            }
            return false;
          }
          return false;
        };

        searchExchange.subscribe("searching", $attrs.view, function(){
          $scope.loading = true;
          $scope.pageTop = 0;
          if(el = document.getElementById($attrs.id+"_loading")){
            document.getElementById($attrs.id+"_loading").style.display = "block";
          }
          if(el = document.getElementById($attrs.id+"_list_container")){
            document.getElementById($attrs.id+"_list_container").style.display = "none";
          }
          if(el = document.getElementById($attrs.id+"_no_results")){
            document.getElementById($attrs.id+"_no_results").style.display = "none";
          }
        });

        searchExchange.subscribe("noresults", $attrs.view, function(handles, data){
          $scope.renderEmpty();
        });

        searchExchange.subscribe("update", $attrs.view, function(handles, data){
          updateResume(handles);
        });
        searchExchange.subscribe("resume", $attrs.view, function(handles, data){
          updateResume(handles);
        });

        function updateResume(handles){
          setTimeout(function(){
            if(searchExchange.state && searchExchange.state.sort){
              $scope.sort = searchExchange.state.sort;
            }
            if(searchExchange.state!=null && (searchExchange.state.page!=null)){
              $scope.pageTop = ($scope.config.pagesize * searchExchange.state.page);
            }
            if($scope.handle){
              if(handles){
                if(handles.indexOf($scope.handle)!=-1){
                    $scope.render();
                };
              }
              else{
                $scope.render();
              }
            }
            else{
              $scope.postponed = function(){
                if(handles){
                  if(handles.indexOf($scope.handle)!=-1){
                      $scope.render();
                  };
                }
                else{
                  $scope.render();
                }
              }
            }
          },100);
        }

        $scope.showItem = function(approved, entity){
          return approved=='True' || userManager.canApprove(entity);
        };

        $scope.changePage = function(direction){
          $scope.pageTop += ($scope.config.pagesize * direction);
          $scope.render();
        };

        $scope.setPage = function(pageNumber){
          searchExchange.setStateAttr("page", pageNumber);
          $scope.pageTop = ($scope.config.pagesize * pageNumber);
          $scope.render();
        }

        $scope.pageInRange = function(pageIndex){
					var minPage, maxPage;
					if($scope.pages.length==1){
						return false;
					}
					else if($scope.currentPage <= 2){
						minPage = 1;
						maxPage = 5
					}
					else if ($scope.currentPage >= $scope.pages.length - 2) {
						minPage = $scope.pages.length - 5;
						maxPage = $scope.pages.length;
					}
					else{
						minPage = $scope.currentPage - 2;
						maxPage = $scope.currentPage + 2;
					}
					return (pageIndex >= minPage && pageIndex <= maxPage);
				};

        $scope.render = function(){
          if(el = $("#"+$attrs.id).find("._list")[0]){

          }
          else{
            return;
          }
          searchExchange.ask($scope.handle, "GetLayout", [], function(response){
            var layout = response.result.qLayout;
            $scope.qFields = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);
            searchExchange.ask($scope.handle, "GetHyperCubeData", ["/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:0, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]], function(response){
              var data = response.result.qDataPages;
              var items = [];
              var hiddenCount = 0;
              $scope.$apply(function(){
                $scope.loading = false;
                $scope.pageTop = data[0].qArea.qTop;
                $scope.pageBottom = (data[0].qArea.qTop + data[0].qArea.qHeight);
                $scope.currentPage = Math.ceil($scope.pageBottom / $scope.config.pagesize);
                $scope.total = layout.qHyperCube.qSize.qcy;
                $scope.pages = [];
                for(var i=1;i<(Math.ceil($scope.total/$scope.config.pagesize)+1);i++){
                  $scope.pages.push(i);
                }
                $scope.items = [];
                var totals = {};
                var max = {};
                var min = {};
                for(var i=0;i<layout.qHyperCube.qMeasureInfo.length;i++){
                  max[layout.qHyperCube.qMeasureInfo[i].qFallbackTitle] = layout.qHyperCube.qMeasureInfo[i].qMax;
                  min[layout.qHyperCube.qMeasureInfo[i].qFallbackTitle] = layout.qHyperCube.qMeasureInfo[i].qMin;
                  totals[layout.qHyperCube.qMeasureInfo[i].qFallbackTitle] = layout.qHyperCube.qGrandTotalRow[i].qNum;
                }
                for(var i=0;i<data[0].qMatrix.length;i++){
                  var item = {}
                  //if the nullSuppressor field is null then we throw out the row
                  if($scope.config.nullSuppressor!=null && data[0].qMatrix[i][$scope.config.nullSuppressor].qText=="-"){
                    continue;
                  }
                  for (var j=0; j < data[0].qMatrix[i].length; j++){
                    item[$scope.qFields[j].qFallbackTitle] = data[0].qMatrix[i][j].qText;

                  }
                  if(item["rating"]!="-"){
                    item.stars = [];
                    var stars = parseInt(item.rating);
                    for(var k=0;k<stars;k++){
                      item.stars.push(k);
                    }
                  }
                  item.hidden = $scope.isHidden(item[$scope.config.primaryKey]);
                  if(item.hidden){
                    hiddenCount++;
                  }
                  items.push( item );
                }

                var sortEl = $("#"+$attrs.id).find("._sort")[0];
                selectSortOption(sortEl, $scope.sort);

                if(hiddenCount==items.length){
                  if(!userManager.hasUser){
                    $scope.renderEmpty();
                    return;
                  }
                  else if (!userManager.canApprove($scope.entity)) {
                    $scope.renderEmpty();
                    return;
                  }
                }
                if(items.length>0){
                  $scope.loading = false;
                  $scope.items = items;
                  //$element.find(".result-list").html("test");
                  var terms = []
                  if(searchExchange.state && searchExchange.state.searchText){
                    terms = searchExchange.state.searchText.split(" ");
                  }
                  $("#"+$attrs.id).find("._count_label")[0].innerHTML = "Showing " + ($scope.pageTop+1) + " - " + $scope.pageBottom + " of " + $scope.total + " results";
                  if($scope.resultsTemplate){
                    $("#"+$attrs.id).find("._list")[0].innerHTML = $scope.resultsTemplate.getHTML({items:items, terms: terms, totals: totals, max:max, min:min, bucket: $scope.$root.bucket});
                  }
                  else{
                    $scope.resultsTemplateCallback = function(){
                      $("#"+$attrs.id).find("._list")[0].innerHTML = $scope.resultsTemplate.getHTML({items:items, terms: terms, totals: totals, max:max, min:min, bucket: $scope.$root.bucket});
                    }
                  }
                  if($scope.pagingTemplate){
                    $("#"+$attrs.id).find("._paging")[0].innerHTML = $scope.pagingTemplate.getHTML({currentPage:$scope.currentPage, pages: $scope.pages});
                  }
                  else{
                    $scope.pagingTemplateCallback = function(){
                      $("#"+$attrs.id).find("._paging")[0].innerHTML = $scope.pagingTemplate.getHTML({currentPage:$scope.currentPage, pages: $scope.pages});
                    }
                  }
                  $("#"+$attrs.id).find("._list_container")[0].style.display = "block";
                  $("#"+$attrs.id).find("._no_results")[0].style.display = "none";
                }
                else{
                  $scope.loading = false;
                  $("#"+$attrs.id).find("._list_container")[0].style.display = "none";
                  $("#"+$attrs.id).find("._no_results")[0].style.display = "block";
                  $scope.items = [];
                }
                $("#"+$attrs.id).find("._loading")[0].style.display = "none";
                if(layout.qHyperCube.qSize.qcx < $scope.fields.length){
                  $scope.pageWidth();
                }
              });
            });
          });
        };

        $scope.renderEmpty = function(){
            $scope.loading = false;
            $("#"+$attrs.id).find("._loading")[0].style.display = "none";
            $("#"+$attrs.id).find("._list_container")[0].style.display = "none";
            $("#"+$attrs.id).find("._no_results")[0].style.display = "block";
            $scope.items = [];
        };

        $scope.pageWidth = function(){  //we currently only support paging width once (i.e. up to 20 fields)
          //$scope.info.object.getHyperCubeData("/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:10, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]).then(function(data){
          searchExchange.ask($scope.handle, "GetLayout", [], function(response){
            var layout = response.qLayout;
            $scope.qFields = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);
            searchExchange.ask($scope.handle, "GetHyperCubeData", ["/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:10, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]], function(response){
              var data = response.qDataPages;
              $scope.$apply(function(){
                data[0].qMatrix.map(function(row, index){
                  var item = $scope.items[index];
                  for (var i=0; i < row.length; i++){
                    item[$scope.qFields[i].qFallbackTitle] = row[i].qText;
                  }
                  return item;
                });
              });
            });
          });
        };

        $scope.applySort = function(sort, render){
          searchExchange.setStateAttr("sort", sort);
          searchExchange.ask($scope.handle, "ApplyPatches", [[{
            qPath: "/qHyperCubeDef/qInterColumnSortOrder",
            qOp: "replace",
            qValue: getFieldIndex(sort.field)
          }], true], function(){
            if(render && render==true){
              $scope.render();
            }
          });
        };

        function getFieldIndex(field, asString){
          for (var i=0;i<$scope.fields.length;i++){
            if($scope.fields[i].dimension && $scope.fields[i].dimension==field){
              if(asString!=undefined && asString==false){
                return [i];
              }
              else {
                return "["+i+"]";
              }
            }
            else if ($scope.fields[i].label && $scope.fields[i].label==field) {
              if(asString!=undefined && asString==false){
                return [i];
              }
              else {
                return "["+i+"]";
              }
            }
          }
          return 0;
        };

        function selectSortOption(elem, option){
          for (var i=0;i<elem.options.length;i++){
            if(elem.options[i].value == option.id){
              elem.options[i].setAttribute('selected','')
            }
            else{
              elem.options[i].removeAttribute('selected')
            }
          }
        }

        $scope.$root.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
          //if there is an existing state we should update the pageTop property on the scope
          //and apply patches to the object for sorting
          if(fromState.name.split(".")[0]==toState.name.split(".")[0]){ //then we should clear the search state
            if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
              if(searchExchange.state && searchExchange.state.sort){
                $scope.applySort(searchExchange.state.sort);
              }
            }
          }
        });

        $scope.$root.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
          if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
            if(searchExchange.state){
              if(searchExchange.state.page || searchExchange.state.sort){
                searchExchange.render();
              }
            }
          }
        });


        searchExchange.addResults({
            id: $attrs.id,
            fields: $scope.fields,
            sortOptions: $scope.sortOptions,
            defaultSort: getFieldIndex($scope.sort.field, false)
          }, function(result){
            $scope.handle = result.handle;
            if(!$scope.resultsTemplate){
              $.get($scope.template).success(function(html){
                $scope.resultsTemplate = new Templater(html);
                if($scope.resultsTemplateCallback){
                  $scope.resultsTemplateCallback.call();
                  $scope.resultsTemplateCallback = null;
                }
              });
            }
            if(!$scope.pagingTemplate){
              $.get("/views/search/search-paging.html").success(function(html){
                $scope.pagingTemplate = new Templater(html);
                if($scope.pagingTemplateCallback){
                  $scope.pagingTemplateCallback.call();
                  $scope.pagingTemplateCallback = null;
                }
              });
            }
            if($scope.postponed){
              $scope.postponed.call();
            }
            else{
              if($attrs.id.indexOf("users.")==-1){
                updateResume([result.handle]);
              }
            }
          });

      }});
    }],
    templateUrl: "/views/search/search-results.html"
  }
}])
