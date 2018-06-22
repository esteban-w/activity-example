// Constructor definition
var Animal = function (options) {
    this.type = options.type;
    this.legs = options.legs;
};


// Template compiler module
(function () {
    this.templateCompiler = function (template, data) {
        // templating function inspired by concepts from John Resig - https://johnresig.com/
        var compiler = Function( "_",
            "var c = [];" +
            "c.push('" +
            template
                .replace(/[\r\n\t]/g, "")
                .split("{{")
                .join("\t")
                .replace(/\t([^#]*?)}}/g, "'+$1+'")
                .split("\t#")
                .join("');")
                .split("}}")
                .join("c.push('") +
            "'); " +
            "return c.join('');"
        );
        return data ? compiler(data) : null;
    };
})();


// Modal module
var modalModule = (function () {

    // DOM references
    var body = document.getElementsByTagName('body')[0];
    var modalElement;

    // Template
    var template = document.getElementById('modal_template').innerHTML;


    function _clickHandler(eventObj) {
        if( (eventObj.target.id === 'modal') || (eventObj.target.className.search('modal__close-button') > -1) ){
            _destroy();
        }
    }

    function create(dataObj) {
        modalElement = document.createElement('div');
        modalElement.className = 'modal';
        modalElement.id = 'modal';
        modalElement.setAttribute('role','dialog');
        modalElement.innerHTML = templateCompiler(template, dataObj);

        body.appendChild(modalElement);
        body.className += 'modal-parent';

        // Bind events
        body.addEventListener('click',_clickHandler);
    }

    function _destroy() {
        // Unbind events
        body.removeEventListener('click',_clickHandler);

        body.removeChild(modalElement);
        body.className = body.className.replace('modal-parent','')
    }

    return {
        create: create
    }
})();


// Main module
var mainModule = (function () {

    // Allowed types
    var animalTypes = {
        chicken: { legs:2, type:'chicken' },
        rabbit: { legs:4, type:'rabbit' }
    };

    // Main collection
    var animals = [ ];

    // DOM references
    var stage = document.getElementById('stage');
    var globalCounter = document.getElementById('counter_display');
    var controls = document.getElementById('controls');
    var popAudio = document.getElementsByTagName('audio')[0];

    // Templates
    var listTemplate = document.getElementById('list_template').innerHTML;
    var counterTemplate = document.getElementById('counter_template').innerHTML;
    var controlsTemplate = document.getElementById('controls_template').innerHTML;

    // Bind events
    controls.addEventListener('click', _controlsHandler);

    _render();

    function _render() {
        var countObj = _countAnimals();
        globalCounter.innerHTML = templateCompiler(counterTemplate, countObj );
        stage.innerHTML = templateCompiler(listTemplate, animals);
        controls.innerHTML = templateCompiler(controlsTemplate, countObj)
    }

    function _controlsHandler(eventObj) {
        var currentId = eventObj.target.id;
        if(currentId.search('_add') > -1){
            _addAnimal(currentId.replace('_add',''));
        } else if(currentId.search('_remove') > -1){
            _removeType(currentId.replace('_remove',''));
        } else if(currentId.search('submit_button') > -1){
            _submitAnswer();
        }
    }

    function _addAnimal(type) {
        if((!animalTypes[type])||(animals.length === 18)) return;
        var newAnimal = new Animal(animalTypes[type]);
        animals.push(newAnimal);
        popAudio.play();
        _render()
    }

    function _removeType(type) {
        for(var i=(animals.length-1); i > -1; i--){
            if( animals[i]["type"] === type ){
                _removeAnimal(i);
                break;
            }
        }
    }

    function _removeAnimal(index) {
        if(typeof index ==="undefined"){
            index = (animals.length-1);
        }
        animals.splice(index,1);
        popAudio.play();
        _render()
    }

    function _countAnimals() {
        var animalsObj = { total: animals.length };
        for(var i=0; i < animals.length; i++){
            var currentType = animals[i]["type"];
            if( !animalsObj[ currentType ] ){
                animalsObj[ currentType ] = 1;
            } else {
                animalsObj[ currentType ]++;
            }
        }
        return animalsObj;
    }

    function _submitAnswer() {
        var totalLegs = 0,
            dataObj = {};
        for(var key in animals){
            totalLegs += animals[key]['legs'];
        }
        if((totalLegs === 44) && (animals.length === 18)){
            dataObj.type = 'success';
            dataObj.content = 'Congratulations!! your answer is correct!! There are '
                + animals.length +' animals and a total of '+ totalLegs +' legs.';
        } else {
            dataObj.type ='failure';
            dataObj.content = 'Remember, chickens have 2 legs and rabbits 4 legs, current totals are: '
                + animals.length +' animals and '+ totalLegs +' legs.';
        }
        modalModule.create(dataObj);
    }
})();
