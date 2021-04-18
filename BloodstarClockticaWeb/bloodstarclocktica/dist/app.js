/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blood-bind.ts":
/*!***************************!*\
  !*** ./src/blood-bind.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unbindElement = exports.bindLabel = exports.bindComboBox = exports.bindCheckbox = exports.EnumProperty = exports.Property = void 0;
var Property = /** @class */ (function () {
    function Property(value) {
        this.value = value;
        this.listeners = [];
    }
    Property.prototype.set = function (value) {
        if (this.value !== value) {
            this.value = value;
            this._notifyListeners();
        }
    };
    Property.prototype.get = function () {
        return this.value;
    };
    Property.prototype.addListener = function (cb) {
        this.listeners.push(cb);
    };
    Property.prototype.removeListener = function (cb) {
        this.listeners = this.listeners.filter(function (i) { return i !== cb; });
    };
    Property.prototype.removeAllListeners = function () {
        this.listeners = [];
    };
    Property.prototype._notifyListeners = function () {
        var _this = this;
        var backup = this.listeners.concat();
        backup.forEach(function (cb) { return cb(_this.value); });
    };
    return Property;
}());
exports.Property = Property;
var EnumProperty = /** @class */ (function (_super) {
    __extends(EnumProperty, _super);
    function EnumProperty(value, displayValuePairs) {
        var _this = _super.call(this, value) || this;
        _this.options = displayValuePairs;
        return _this;
    }
    return EnumProperty;
}(Property));
exports.EnumProperty = EnumProperty;
/// central authority on bindings
var bindings = new Map();
/// bindings for a checkbox
var CheckboxBinding = /** @class */ (function () {
    function CheckboxBinding(element, property) {
        this.element = element;
        this.property = property;
        this.syncFromElementToProperty = function (_) { return property.set(element.checked); };
        this.syncFromPropertyToElement = function (v) { return element.checked = v; };
        element.checked = property.get();
        element.addEventListener('change', this.syncFromElementToProperty);
        property.addListener(this.syncFromPropertyToElement);
    }
    CheckboxBinding.prototype.destroy = function () {
        var _a, _b;
        if (this.syncFromElementToProperty !== null) {
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.removeEventListener('change', this.syncFromElementToProperty);
            this.syncFromElementToProperty = null;
        }
        if (this.syncFromPropertyToElement !== null) {
            (_b = this.property) === null || _b === void 0 ? void 0 : _b.removeListener(this.syncFromPropertyToElement);
            this.syncFromPropertyToElement = null;
        }
        this.element = null;
        this.property = null;
    };
    return CheckboxBinding;
}());
/// ONE WAY binding for displaying something in innerText
var LabelBinding = /** @class */ (function () {
    function LabelBinding(element, property) {
        this.element = element;
        this.property = property;
        this.syncFromPropertyToElement = function (v) { return element.innerText = v; };
        element.innerText = property.get();
        property.addListener(this.syncFromPropertyToElement);
    }
    LabelBinding.prototype.destroy = function () {
        var _a;
        if (this.syncFromPropertyToElement !== null) {
            (_a = this.property) === null || _a === void 0 ? void 0 : _a.removeListener(this.syncFromPropertyToElement);
        }
        this.element = null;
        this.property = null;
        this.syncFromPropertyToElement = null;
    };
    return LabelBinding;
}());
/// bindings for a ComboBox and EnumProperty
var ComboBoxBinding = /** @class */ (function () {
    function ComboBoxBinding(element, property) {
        this.element = element;
        this.property = property;
        this.syncFromElementToProperty = function (_) { return property.set(element.value); };
        this.syncFromPropertyToElement = function (v) { return element.value = v; };
        element.innerText = '';
        property.options.forEach(function (data) {
            var display = data.display, value = data.value;
            var optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.innerText = display;
            element.appendChild(optionElement);
        });
        element.value = property.get();
        element.addEventListener('change', this.syncFromElementToProperty);
        property.addListener(this.syncFromPropertyToElement);
    }
    ComboBoxBinding.prototype.destroy = function () {
        var _a, _b;
        if (null !== this.syncFromElementToProperty) {
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.removeEventListener('change', this.syncFromElementToProperty);
        }
        if (null !== this.syncFromPropertyToElement) {
            (_b = this.property) === null || _b === void 0 ? void 0 : _b.removeListener(this.syncFromPropertyToElement);
        }
        this.element = null;
        this.property = null;
        this.syncFromElementToProperty = null;
        this.syncFromPropertyToElement = null;
    };
    return ComboBoxBinding;
}());
/// bind checkbox to some data
function bindCheckbox(checkboxElement, boolProperty) {
    unbindElement(checkboxElement);
    bindings.set(checkboxElement, new CheckboxBinding(checkboxElement, boolProperty));
}
exports.bindCheckbox = bindCheckbox;
/// bind ComboBox to EnumProperty
function bindComboBox(selectElement, enumProperty) {
    unbindElement(selectElement);
    bindings.set(selectElement, new ComboBoxBinding(selectElement, enumProperty));
}
exports.bindComboBox = bindComboBox;
/// ONE WAY! binding of an element's .innerText to a Property
function bindLabel(element, property) {
    unbindElement(element);
    bindings.set(element, new LabelBinding(element, property));
}
exports.bindLabel = bindLabel;
/// clear element's current binding, if any
function unbindElement(element) {
    var _a;
    if (bindings.has(element)) {
        (_a = bindings.get(element)) === null || _a === void 0 ? void 0 : _a.destroy();
    }
    bindings.delete(element);
}
exports.unbindElement = unbindElement;
var BloodBind = {
    Property: Property,
    EnumProperty: EnumProperty,
    bindCheckbox: bindCheckbox,
    bindComboBox: bindComboBox,
    bindLabel: bindLabel,
    unbindElement: unbindElement
};
exports.default = BloodBind;


/***/ }),

/***/ "./src/blood-document.ts":
/*!*******************************!*\
  !*** ./src/blood-document.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BloodDocument = exports.BloodCharacter = exports.BloodDocumentMetaAlmanac = exports.BloodDocumentMeta = exports.BloodTeam = void 0;
var BloodBind = __webpack_require__(/*! ./blood-bind */ "./src/blood-bind.ts");
var LoadDlg = __webpack_require__(/*! ./dlg/blood-loading-dlg */ "./src/dlg/blood-loading-dlg.ts");
var bloodIdCounter = -1;
function genBloodId() {
    var now = new Date();
    var random = '';
    for (var i = 0; i < 4; ++i) {
        random += (Math.random() * 16 | 0).toString(16);
    }
    ++bloodIdCounter;
    return now.getFullYear() + "." + now.getMonth() + "." + now.getDate() + "." + now.getHours() + "." + now.getMinutes() + "." + now.getSeconds() + "." + now.getMilliseconds() + "." + random + "." + bloodIdCounter;
}
function hashFunc(input) {
    var hash = 0;
    input += '; So say we all.';
    for (var i = 0; i < input.length; ++i) {
        var char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash | 0;
    }
    return hash;
}
var BloodTeam = /** @class */ (function () {
    function BloodTeam() {
    }
    BloodTeam.toIdString = function (displayString) {
        switch (displayString.toLowerCase()) {
            case "townsfolk":
                return BloodTeam.TOWNSFOLK;
            case "outsider":
                return BloodTeam.OUTSIDER;
            case "minion":
                return BloodTeam.MINION;
            case "demon":
                return BloodTeam.DEMON;
            case "traveller":
            case "traveler":
                return BloodTeam.TRAVELER;
            default:
                return BloodTeam.TOWNSFOLK;
        }
    };
    BloodTeam.toDisplayString = function (teamString) {
        switch (teamString.toLowerCase()) {
            case "townsfolk":
                return BloodTeam.TOWNSFOLK_DISPLAY;
            case "outsider":
                return BloodTeam.OUTSIDER_DISPLAY;
            case "minion":
                return BloodTeam.MINION_DISPLAY;
            case "demon":
                return BloodTeam.DEMON_DISPLAY;
            case "traveller":
            case "traveler":
                return BloodTeam.TRAVELER_DISPLAY;
            default:
                return BloodTeam.TOWNSFOLK_DISPLAY;
        }
    };
    /// {display, value}
    BloodTeam.options = function () {
        return [
            { display: BloodTeam.TOWNSFOLK_DISPLAY, value: BloodTeam.TOWNSFOLK },
            { display: BloodTeam.OUTSIDER_DISPLAY, value: BloodTeam.OUTSIDER },
            { display: BloodTeam.MINION_DISPLAY, value: BloodTeam.MINION },
            { display: BloodTeam.DEMON_DISPLAY, value: BloodTeam.DEMON },
            { display: BloodTeam.TRAVELER_DISPLAY, value: BloodTeam.TRAVELER }
        ];
    };
    BloodTeam.TOWNSFOLK = 'townsfolk';
    BloodTeam.OUTSIDER = 'outsider';
    BloodTeam.MINION = 'minion';
    BloodTeam.DEMON = 'demon';
    BloodTeam.TRAVELER = 'traveler';
    BloodTeam.TOWNSFOLK_DISPLAY = 'Townsfolk';
    BloodTeam.OUTSIDER_DISPLAY = 'Outsider';
    BloodTeam.MINION_DISPLAY = 'Minion';
    BloodTeam.DEMON_DISPLAY = 'Demon';
    BloodTeam.TRAVELER_DISPLAY = 'Traveler';
    return BloodTeam;
}());
exports.BloodTeam = BloodTeam;
var BloodDocumentMeta = /** @class */ (function () {
    function BloodDocumentMeta() {
        this.name = new BloodBind.Property('New Edition');
        this.author = new BloodBind.Property('');
        this.logo = new BloodBind.Property(null);
        this.almanac = new BloodDocumentMetaAlmanac();
    }
    /// DESTRUCTIVE
    BloodDocumentMeta.prototype.reset = function (name) {
        this.name.set(name);
        this.author.set('');
        this.logo.set(null);
        this.almanac.reset();
    };
    BloodDocumentMeta.prototype.getSaveData = function () {
        return {
            name: this.name.get(),
            author: this.author.get(),
            logo: this.logo.get(),
            almanac: this.almanac.getSaveData(),
        };
    };
    BloodDocumentMeta.prototype.getName = function () { return this.name.get(); };
    return BloodDocumentMeta;
}());
exports.BloodDocumentMeta = BloodDocumentMeta;
var BloodDocumentMetaAlmanac = /** @class */ (function () {
    function BloodDocumentMetaAlmanac() {
        this.synopsis = new BloodBind.Property('');
        this.overview = new BloodBind.Property('');
    }
    /// DESTRUCTIVE
    BloodDocumentMetaAlmanac.prototype.reset = function () {
        this.synopsis.set('');
        this.overview.set('');
    };
    BloodDocumentMetaAlmanac.prototype.getSaveData = function () {
        return {
            synopsis: this.synopsis.get(),
            overview: this.overview.get(),
        };
    };
    return BloodDocumentMetaAlmanac;
}());
exports.BloodDocumentMetaAlmanac = BloodDocumentMetaAlmanac;
var BloodCharacter = /** @class */ (function () {
    function BloodCharacter() {
        this.id = new BloodBind.Property('newcharacter');
        this.name = new BloodBind.Property('New Character');
        this.unStyledImage = new BloodBind.Property(null);
        this.styledImage = new BloodBind.Property(null);
        this.team = new BloodBind.EnumProperty(BloodTeam.TOWNSFOLK, BloodTeam.options());
        this.export = new BloodBind.Property(true);
    }
    BloodCharacter.prototype.getIdProperty = function () { return this.id; };
    BloodCharacter.prototype.getNameProperty = function () { return this.name; };
    BloodCharacter.prototype.getName = function () { return this.name.get(); };
    BloodCharacter.prototype.getUnStyledImageProperty = function () { return this.unStyledImage; };
    BloodCharacter.prototype.getStyledImageProperty = function () { return this.styledImage; };
    BloodCharacter.prototype.getTeamPropertyProperty = function () { return this.team; };
    BloodCharacter.prototype.getExportProperty = function () { return this.export; };
    return BloodCharacter;
}());
exports.BloodCharacter = BloodCharacter;
var BloodDocument = /** @class */ (function () {
    function BloodDocument() {
        this.bloodId = genBloodId();
        this.previewOnToken = new BloodBind.Property(true);
        this.dirty = new BloodBind.Property(false);
        this.meta = new BloodDocumentMeta();
        this.windowTitle = new BloodBind.Property('Bloodstar Clocktica');
        // TODO: list properties
        this.characterList = [new BloodCharacter()];
        this.firstNightOrder = [];
        this.otherNightOrder = [];
        // TODO: hook up auto-dirty
        // TODO: hook up automatic title change on dirty
    }
    /// DESTRUCTIVE
    BloodDocument.prototype.reset = function (name) {
        this.bloodId = genBloodId();
        this.previewOnToken.set(true);
        this.meta.reset(name);
        this.windowTitle.set('Bloodstar Clocktica');
        this.characterList.length = 0;
        this.addNewCharacter();
        this.firstNightOrder = [];
        this.otherNightOrder = [];
        this.dirty.set(false);
    };
    BloodDocument.prototype.getCharacterList = function () {
        return this.characterList;
    };
    BloodDocument.prototype.addNewCharacter = function () {
        this.characterList.push(new BloodCharacter());
        this.dirty.set(true);
    };
    BloodDocument.prototype.saveAs = function (_name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("not yet implemented");
            });
        });
    };
    BloodDocument.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, LoadDlg.show(this._save())];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BloodDocument.prototype._save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var saveData, response, responseText, responseJson, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        saveData = {
                            bloodId: this.bloodId,
                            check: hashFunc(this.bloodId),
                            'meta.json': JSON.stringify(this.meta.getSaveData()),
                            src_images: {},
                            roles: {},
                            processed_images: {}
                        };
                        return [4 /*yield*/, fetch('https://www.meyermike.com/bloodstar/save.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(saveData)
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        responseText = _a.sent();
                        responseJson = JSON.parse(responseText);
                        error = responseJson.error;
                        if (error) {
                            throw new Error(error);
                        }
                        this.dirty.set(false);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    BloodDocument.prototype.open = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var openData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        openData = {
                            bloodId: this.bloodId,
                            check: hashFunc(this.bloodId),
                            name: name
                        };
                        return [4 /*yield*/, fetch('https://www.meyermike.com/bloodstar/open.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(openData)
                            })];
                    case 1:
                        response = _a.sent();
                        throw new Error('not yet implemented');
                }
            });
        });
    };
    BloodDocument.prototype.getDirty = function () { return this.dirty.get(); };
    BloodDocument.prototype.getName = function () { return this.meta.getName(); };
    BloodDocument.prototype.getFirstNightOrder = function () {
        return this.firstNightOrder;
    };
    BloodDocument.prototype.getOtherNightOrder = function () {
        return this.otherNightOrder;
    };
    return BloodDocument;
}());
exports.BloodDocument = BloodDocument;


/***/ }),

/***/ "./src/blood-drag.ts":
/*!***************************!*\
  !*** ./src/blood-drag.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BloodDrag = void 0;
var gDragged = null;
var gDraggedOver = null;
var cleanups = new Map();
/// clean up after a renderItems
function clearItems(listElement) {
    var cleanupFn = cleanups.get(listElement);
    if (cleanupFn) {
        cleanupFn(listElement);
        cleanups.delete(listElement);
    }
    listElement.innerText = '';
}
function renderItems(list, data, renderItemFn, cleanupItemFn) {
    clearItems(list);
    data.forEach(function (itemData, index) {
        var li = document.createElement('li');
        li.draggable = true;
        var itemDragData = {
            element: li,
            itemData: itemData,
            list: list,
            listData: data,
            renderItemFn: renderItemFn,
            cleanupItemFn: cleanupItemFn
        };
        li.dataset.index = String(index);
        li.addEventListener('drag', function (_) { return dragBegin(itemDragData); });
        li.addEventListener('dragover', function (e) { return dragOver(e, itemDragData); });
        li.addEventListener('drop', function (_) { return dragEnd(); });
        li.appendChild(renderItemFn(itemData));
        list.appendChild(li);
        // remember how to clean up
        cleanups.set(li, cleanupItemFn);
    });
}
var dragBegin = function (itemDragData) {
    gDragged = itemDragData;
};
var dragOver = function (e, itemDragData) {
    e.preventDefault();
    gDraggedOver = itemDragData;
};
var dragEnd = function () {
    try {
        if (!gDragged || !gDraggedOver) {
            return;
        }
        var draggedElement = gDragged.element, draggedItemData = gDragged.itemData, draggedItemList = gDragged.list, draggedListData = gDragged.listData, renderItemFn = gDragged.renderItemFn, cleanupItemFn = gDragged.cleanupItemFn;
        if (!draggedElement.dataset.index) {
            return;
        }
        var fromIndex = parseInt(draggedElement.dataset.index, 10);
        var draggedOverElement = gDraggedOver.element, draggedOverItemList = gDraggedOver.list;
        if (!draggedOverElement.dataset.index) {
            return;
        }
        var toIndex = parseInt(draggedOverElement.dataset.index, 10);
        if (draggedItemList !== draggedOverItemList) {
            return;
        }
        if (fromIndex === toIndex) {
            return;
        }
        draggedListData.splice(fromIndex, 1);
        draggedListData.splice(toIndex, 0, draggedItemData);
        gDragged = null;
        gDraggedOver = null;
        renderItems(draggedItemList, draggedListData, renderItemFn, cleanupItemFn);
    }
    finally {
        gDragged = null;
        gDraggedOver = null;
    }
};
exports.BloodDrag = {
    renderItems: renderItems
};


/***/ }),

/***/ "./src/blood-util.ts":
/*!***************************!*\
  !*** ./src/blood-util.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.removeAllChildNodes = void 0;
/// clear out all children
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        if (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
    }
}
exports.removeAllChildNodes = removeAllChildNodes;


/***/ }),

/***/ "./src/bloodstar.ts":
/*!**************************!*\
  !*** ./src/bloodstar.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDocument = void 0;
var BloodDocument = __webpack_require__(/*! ./blood-document */ "./src/blood-document.ts");
var blood_drag_1 = __webpack_require__(/*! ./blood-drag */ "./src/blood-drag.ts");
var blood_bind_1 = __webpack_require__(/*! ./blood-bind */ "./src/blood-bind.ts");
var BloodNewOpen = __webpack_require__(/*! ./dlg/blood-new-open-dlg */ "./src/dlg/blood-new-open-dlg.ts");
var BloodOpenDlg = __webpack_require__(/*! ./dlg/blood-open-dlg */ "./src/dlg/blood-open-dlg.ts");
var BloodSdc = __webpack_require__(/*! ./dlg/blood-save-discard-cancel */ "./src/dlg/blood-save-discard-cancel.ts");
var bloodDocument = new BloodDocument.BloodDocument();
var characterListElement = null;
var makeCharacterListItem = function (bloodCharacter) {
    var row = document.createElement('div');
    row.className = 'character-list-item';
    {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        blood_bind_1.default.bindCheckbox(checkbox, bloodCharacter.getExportProperty());
        row.appendChild(checkbox);
    }
    {
        var nameElement = document.createElement('a');
        nameElement.className = 'character-list-name';
        nameElement.onclick = function () { return console.log(bloodCharacter.getName()); };
        blood_bind_1.default.bindLabel(nameElement, bloodCharacter.getNameProperty());
        row.appendChild(nameElement);
    }
    {
        var up = document.createElement('a');
        up.className = 'character-list-button';
        up.innerText = '▲';
        up.onclick = function () { return console.log('up button clicked'); };
        row.appendChild(up);
    }
    {
        var down = document.createElement('a');
        down.className = 'character-list-button';
        down.innerText = '▼';
        down.onclick = function () { return console.log('down button clicked'); };
        row.appendChild(down);
    }
    {
        var del = document.createElement('a');
        del.className = 'character-list-button';
        del.innerText = 'Delete';
        del.onclick = function () { return console.log('delete button clicked'); };
        row.appendChild(del);
    }
    return row;
};
function cleanupListItem(node) {
    node.childNodes.forEach(function (node) {
        blood_bind_1.default.unbindElement(node);
        node.childNodes.forEach(cleanupListItem);
    });
}
;
function addCharacterClicked(_) {
    bloodDocument.addNewCharacter();
    var characterListElement = document.getElementById('characterlist');
    if (characterListElement) {
        blood_drag_1.BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
    }
}
function showHelp() {
}
function hookupClickEvents(data) {
    var e_1, _a;
    try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var _b = __read(data_1_1.value, 2), id = _b[0], cb = _b[1];
            var element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', cb);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
/// file > new clicked
function newFile() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, BloodSdc.savePromptIfDirty()];
                case 1:
                    if (_a.sent()) {
                        bloodDocument.reset('New Edition');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/// file > open clicked
function openFile() {
    return __awaiter(this, void 0, void 0, function () {
        var name_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, BloodSdc.savePromptIfDirty()];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, BloodOpenDlg.show()];
                case 2:
                    name_1 = _a.sent();
                    if (!name_1) return [3 /*break*/, 4];
                    return [4 /*yield*/, bloodDocument.open(name_1)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/// file > save clicked
function saveFile() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bloodDocument.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/// file > save as clicked
function saveFileAs() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            throw new Error('not yet implemented');
        });
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var result, openName, newName, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document.onkeydown = function (e) {
                        if (e.ctrlKey) {
                            if (e.code === 'KeyS') {
                                e.preventDefault();
                                saveFile();
                            }
                        }
                    };
                    hookupClickEvents([
                        ['addcharacterbutton', addCharacterClicked],
                        ['newfilebutton', newFile],
                        ['openfilebutton', openFile],
                        ['savefilebutton', saveFile],
                        ['savefileasbutton', saveFileAs],
                        ['helpbutton', showHelp],
                    ]);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, BloodNewOpen.show()];
                case 2:
                    result = _a.sent();
                    openName = result.openName, newName = result.newName;
                    if (!openName) return [3 /*break*/, 4];
                    return [4 /*yield*/, bloodDocument.open(openName)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    if (newName) {
                        bloodDocument.reset(newName);
                    }
                    else {
                        throw new Error('Bad result from new-open-dlg');
                    }
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_2 = _a.sent();
                    console.error(e_2);
                    bloodDocument.reset('sandbox');
                    return [3 /*break*/, 7];
                case 7:
                    characterListElement = document.getElementById('characterlist');
                    if (characterListElement) {
                        blood_drag_1.BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
;
// wait for dom to load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
}
else {
    // `DOMContentLoaded` already fired
    init();
}
function getDocument() {
    return bloodDocument;
}
exports.getDocument = getDocument;


/***/ }),

/***/ "./src/dlg/blood-dlg.ts":
/*!******************************!*\
  !*** ./src/dlg/blood-dlg.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.init = exports.resolveDialog = void 0;
var dialogData = new Map();
/// show the dialog, store promise callbacks
function openDialog(dialog, resolve, reject) {
    var data = dialogData.get(dialog);
    if (data) {
        data.reject('dialog closed prematurely');
    }
    dialog.style.display = 'flex';
    dialogData.set(dialog, { resolve: resolve, reject: reject });
}
/// resolve promise and hide the dialog
function closeDialog_cb(dialog, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    value = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, callback()];
                case 2:
                    value = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    closeDialog(dialog, value);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/// resolve promise and hide the dialog
function closeDialog(dialog, result) {
    var data = dialogData.get(dialog);
    if (!data) {
        return;
    }
    dialogData.delete(dialog);
    dialog.style.display = 'none';
    data.resolve(result);
}
/// resolve the current dialog
function resolveDialog(element, valueOrPromise) {
    var dialog = element.closest('.dialog-scrim');
    if (!dialog) {
        return;
    }
    var data = dialogData.get(dialog);
    if (!data) {
        return;
    }
    dialogData.delete(dialog);
    if (dialog instanceof HTMLElement) {
        dialog.style.display = 'none';
    }
    data.resolve(valueOrPromise);
}
exports.resolveDialog = resolveDialog;
/// prepare a dialog
/// 
/// id - css id for the dialog
/// body - Array of elements to be added inside the dialog
/// buttons - Array of Objects that look like {label:'someLabel', callback:someCallback}. used to create buttons
///           The callback should return a promise, whose result will be used as the result of the dialog
/// return - an array containing:
///            0: a function that you can call to open the popup `function openFn():Promise{...}`
///            1: a function you can call to close the popup early `function closeFn(result):void{...}`
function init(id, body, buttons) {
    var e_1, _a, e_2, _b;
    var _this = this;
    // TODO: track whether this id was used before. early exit if it has been
    var dialog = document.createElement('div');
    dialog.className = 'dialog-scrim';
    dialog.id = id;
    dialog.style.display = 'none';
    var box = document.createElement('div');
    box.className = 'dialog-box';
    var btnGroup = document.createElement('div');
    btnGroup.className = 'dialog-btn-group';
    var _loop_1 = function (label, callback) {
        var btn = document.createElement('button');
        btn.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, closeDialog_cb(dialog, callback)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); });
        btn.innerText = label;
        btnGroup.appendChild(btn);
    };
    try {
        // create buttons
        for (var buttons_1 = __values(buttons), buttons_1_1 = buttons_1.next(); !buttons_1_1.done; buttons_1_1 = buttons_1.next()) {
            var _c = buttons_1_1.value, label = _c.label, callback = _c.callback;
            _loop_1(label, callback);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (buttons_1_1 && !buttons_1_1.done && (_a = buttons_1.return)) _a.call(buttons_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        // add body elements to box
        for (var body_1 = __values(body), body_1_1 = body_1.next(); !body_1_1.done; body_1_1 = body_1.next()) {
            var element = body_1_1.value;
            box.appendChild(element);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (body_1_1 && !body_1_1.done && (_b = body_1.return)) _b.call(body_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    // followed by buttons
    box.appendChild(btnGroup);
    // box in dlg, dlg in document.
    dialog.appendChild(box);
    document.body.appendChild(dialog);
    // TODO: should be an object
    var funcs = [
        function () { return new Promise(function (resolve, reject) { return openDialog(dialog, resolve, reject); }); },
        function (result) { return closeDialog(dialog, result); }
    ];
    return funcs;
}
exports.init = init;


/***/ }),

/***/ "./src/dlg/blood-loading-dlg.ts":
/*!**************************************!*\
  !*** ./src/dlg/blood-loading-dlg.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.show = void 0;
// newfile/openfile dialog for bloodstar clocktica
var BloodDlg = __webpack_require__(/*! ./blood-dlg */ "./src/dlg/blood-dlg.ts");
var initted = false;
var showFn = null;
var closeFn = null;
/// prepare the dialog for use
function init() {
    var _a;
    if (initted) {
        return;
    }
    initted = true;
    var spinner = document.createElement('div');
    spinner.className = 'spinner';
    _a = __read(BloodDlg.init('new-open-dlg', [spinner], []), 2), showFn = _a[0], closeFn = _a[1];
}
/// show the spinner until the promise resolves
function show(somePromise) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!initted) {
                        init();
                    }
                    if (!showFn) {
                        throw new Error("no showFn");
                    }
                    if (!closeFn) {
                        throw new Error("no closeFn");
                    }
                    // ignore result promise
                    showFn();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, somePromise];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    closeFn(null);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.show = show;


/***/ }),

/***/ "./src/dlg/blood-new-open-dlg.ts":
/*!***************************************!*\
  !*** ./src/dlg/blood-new-open-dlg.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.close = exports.show = void 0;
// newfile/openfile dialog for bloodstar clocktica
var BloodDlg = __webpack_require__(/*! ./blood-dlg */ "./src/dlg/blood-dlg.ts");
var BloodOpenDlg = __webpack_require__(/*! ./blood-open-dlg */ "./src/dlg/blood-open-dlg.ts");
var initted = false;
var showFn = null;
var closeFn = null;
/// user chose to open an existing file
function openExisting() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, BloodOpenDlg.show()];
                case 1:
                    result = _a.sent();
                    if (!!result) return [3 /*break*/, 3];
                    return [4 /*yield*/, show()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [2 /*return*/, { openName: result }];
            }
        });
    });
}
/// user chose to create a new file
function createNew() {
    return Promise.resolve({ newName: 'New Edition' });
}
/// prepare the dialog for use
function init() {
    var _a;
    if (initted) {
        return;
    }
    initted = true;
    var message = document.createElement('span');
    message.innerText = 'To get started, open an existing edition or create a new one.';
    var buttons = [
        { label: 'Open Existing', callback: openExisting },
        { label: 'Create New', callback: createNew }
    ];
    _a = __read(BloodDlg.init('new-open-dlg', [message], buttons), 2), showFn = _a[0], closeFn = _a[1];
}
/// bring up dialog for picking whether to open an existing file or start a new one
/// returns a promise that resolves to an object like one of these:
///   {'open': <name>}
///   {'new': <name>}
function show() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!initted) {
                        init();
                    }
                    if (!showFn) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, showFn()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.show = show;
/// take down the popup
function close(result) {
    if (!closeFn) {
        return;
    }
    closeFn(result);
}
exports.close = close;


/***/ }),

/***/ "./src/dlg/blood-open-dlg.ts":
/*!***********************************!*\
  !*** ./src/dlg/blood-open-dlg.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.close = exports.show = void 0;
// open dialog for bloodstar clocktica
var BloodDlg = __webpack_require__(/*! ./blood-dlg */ "./src/dlg/blood-dlg.ts");
var Util = __webpack_require__(/*! ../blood-util */ "./src/blood-util.ts");
var initted = false;
var showFn = null;
var closeFn = null;
var fileListDiv = null;
/// user chose to cancel
function cancelClicked() {
    return Promise.resolve(null);
}
/// prepare the dialog for use
function init() {
    var _a;
    if (initted) {
        return;
    }
    initted = true;
    var message = document.createElement('span');
    message.innerText = 'Choose an existing file to open:';
    fileListDiv = document.createElement('div');
    fileListDiv.className = 'open-dlg-list';
    var buttons = [{ label: 'Cancel', callback: cancelClicked }];
    _a = __read(BloodDlg.init('open-dlg', [message, fileListDiv], buttons), 2), showFn = _a[0], closeFn = _a[1];
}
/// update list of files
function repopulateFileList(fileList) {
    var e_1, _a;
    if (!fileListDiv) {
        return;
    }
    Util.removeAllChildNodes(fileListDiv);
    if (fileList.length === 0) {
        var span = document.createElement('span');
        span.innerText = 'No files found.';
        fileListDiv.appendChild(span);
    }
    else {
        var _loop_1 = function (name_1) {
            var element = document.createElement('a');
            element.addEventListener('click', function (_) { return BloodDlg.resolveDialog(element, name_1); });
            element.innerText = name_1;
            fileListDiv.appendChild(element);
        };
        try {
            for (var fileList_1 = __values(fileList), fileList_1_1 = fileList_1.next(); !fileList_1_1.done; fileList_1_1 = fileList_1.next()) {
                var name_1 = fileList_1_1.value;
                _loop_1(name_1);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (fileList_1_1 && !fileList_1_1.done && (_a = fileList_1.return)) _a.call(fileList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
/// bring up dialog for picking whether to open an existing file or start a new one
/// returns a promise that resolves to a name, or null if the dialog was cancelled
function show() {
    return __awaiter(this, void 0, void 0, function () {
        var response, responseText, responseJson, error, files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!initted) {
                        init();
                    }
                    if (!showFn) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('https://www.meyermike.com/bloodstar/list.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    responseText = _a.sent();
                    responseJson = JSON.parse(responseText);
                    error = responseJson.error, files = responseJson.files;
                    if (error) {
                        throw new Error(error);
                    }
                    repopulateFileList(files);
                    return [4 /*yield*/, showFn()];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.show = show;
/// take down the popup
function close(result) {
    if (!closeFn) {
        return;
    }
    closeFn(result);
}
exports.close = close;


/***/ }),

/***/ "./src/dlg/blood-save-discard-cancel.ts":
/*!**********************************************!*\
  !*** ./src/dlg/blood-save-discard-cancel.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.close = exports.savePromptIfDirty = exports.init = exports.doSave = exports.doSaveAs = void 0;
var Bloodstar = __webpack_require__(/*! ../bloodstar */ "./src/bloodstar.ts");
var BloodDlg = __webpack_require__(/*! ./blood-dlg */ "./src/dlg/blood-dlg.ts");
var initted = false;
var showFn = function () { return Promise.resolve(null); };
var closeFn = function (_) { };
function addToRecentDocuments() {
}
function updateNightOrder() {
}
/// save the current document under a new name
function doSaveAs(saveId) {
    updateNightOrder();
    var result = Bloodstar
        .getDocument()
        .saveAs(saveId);
    if (result) {
        addToRecentDocuments();
    }
    return result;
}
exports.doSaveAs = doSaveAs;
function doSave() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updateNightOrder();
                    return [4 /*yield*/, Bloodstar
                            .getDocument()
                            .save()];
                case 1:
                    result = _a.sent();
                    if (result) {
                        addToRecentDocuments();
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.doSave = doSave;
function sdcSaveClicked() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, doSave()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function sdcDiscardClicked() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, true];
        });
    });
}
function sdcCancelClicked() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, false];
        });
    });
}
/// one-time initialization
function init() {
    var _a;
    if (initted) {
        return;
    }
    initted = true;
    var message = document.createElement('span');
    message.innerText = 'You have unsaved changes! Would you like to save now or discard them?';
    var buttons = [
        { label: 'Save', callback: sdcSaveClicked },
        { label: 'Discard', callback: sdcDiscardClicked },
        { label: 'Cancel', callback: sdcCancelClicked },
    ];
    _a = __read(BloodDlg.init('sdc-dlg', [message], buttons), 2), showFn = _a[0], closeFn = _a[1];
}
exports.init = init;
/// if document is dirty, prompt for a save. Call the callback if the user saves or discards changes
function savePromptIfDirty() {
    return __awaiter(this, void 0, void 0, function () {
        var bloodDocument;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!initted) {
                        init();
                    }
                    bloodDocument = Bloodstar.getDocument();
                    if (!bloodDocument.getDirty()) return [3 /*break*/, 2];
                    return [4 /*yield*/, showFn()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, true];
            }
        });
    });
}
exports.savePromptIfDirty = savePromptIfDirty;
;
/// take down the popup
function close(result) {
    if (!closeFn) {
        return;
    }
    closeFn(result);
}
exports.close = close;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/bloodstar.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ibG9vZHN0YXJjbG9ja3RpY2EvLi9zcmMvYmxvb2QtYmluZC50cyIsIndlYnBhY2s6Ly9ibG9vZHN0YXJjbG9ja3RpY2EvLi9zcmMvYmxvb2QtZG9jdW1lbnQudHMiLCJ3ZWJwYWNrOi8vYmxvb2RzdGFyY2xvY2t0aWNhLy4vc3JjL2Jsb29kLWRyYWcudHMiLCJ3ZWJwYWNrOi8vYmxvb2RzdGFyY2xvY2t0aWNhLy4vc3JjL2Jsb29kLXV0aWwudHMiLCJ3ZWJwYWNrOi8vYmxvb2RzdGFyY2xvY2t0aWNhLy4vc3JjL2Jsb29kc3Rhci50cyIsIndlYnBhY2s6Ly9ibG9vZHN0YXJjbG9ja3RpY2EvLi9zcmMvZGxnL2Jsb29kLWRsZy50cyIsIndlYnBhY2s6Ly9ibG9vZHN0YXJjbG9ja3RpY2EvLi9zcmMvZGxnL2Jsb29kLWxvYWRpbmctZGxnLnRzIiwid2VicGFjazovL2Jsb29kc3RhcmNsb2NrdGljYS8uL3NyYy9kbGcvYmxvb2QtbmV3LW9wZW4tZGxnLnRzIiwid2VicGFjazovL2Jsb29kc3RhcmNsb2NrdGljYS8uL3NyYy9kbGcvYmxvb2Qtb3Blbi1kbGcudHMiLCJ3ZWJwYWNrOi8vYmxvb2RzdGFyY2xvY2t0aWNhLy4vc3JjL2RsZy9ibG9vZC1zYXZlLWRpc2NhcmQtY2FuY2VsLnRzIiwid2VicGFjazovL2Jsb29kc3RhcmNsb2NrdGljYS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ibG9vZHN0YXJjbG9ja3RpY2Evd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTtJQUlJLGtCQUFZLEtBQU87UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0Qsc0JBQUcsR0FBSCxVQUFJLEtBQU87UUFDUCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQUNELHNCQUFHLEdBQUg7UUFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUNELDhCQUFXLEdBQVgsVUFBWSxFQUE0QjtRQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsaUNBQWMsR0FBZCxVQUFlLEVBQTRCO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBQyxJQUFFLFFBQUMsS0FBRyxFQUFFLEVBQU4sQ0FBTSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNELHFDQUFrQixHQUFsQjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDRCxtQ0FBZ0IsR0FBaEI7UUFBQSxpQkFHQztRQUZHLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFFLElBQUUsU0FBRSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsRUFBZCxDQUFjLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0wsZUFBQztBQUFELENBQUM7QUE5QlksNEJBQVE7QUFtQ3JCO0lBQTZDLGdDQUFtQjtJQUc1RCxzQkFBWSxLQUFlLEVBQUUsaUJBQThDO1FBQTNFLFlBQ0ksa0JBQU0sS0FBSyxDQUFDLFNBRWY7UUFERyxLQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDOztJQUNyQyxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQUFDLENBUDRDLFFBQVEsR0FPcEQ7QUFQWSxvQ0FBWTtBQVN6QixpQ0FBaUM7QUFDakMsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7QUFJMUMsMkJBQTJCO0FBQzNCO0lBS0kseUJBQVksT0FBd0IsRUFBRSxRQUE2QjtRQUMvRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6QixJQUFJLENBQUMseUJBQXlCLEdBQUcsV0FBQyxJQUFFLGVBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUE3QixDQUE2QixDQUFDO1FBQ2xFLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxXQUFDLElBQUUsY0FBTyxDQUFDLE9BQU8sR0FBQyxDQUFDLEVBQWpCLENBQWlCLENBQUM7UUFFdEQsT0FBTyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFakMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNuRSxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDRCxpQ0FBTyxHQUFQOztRQUNJLElBQUksSUFBSSxDQUFDLHlCQUF5QixLQUFLLElBQUksRUFBRTtZQUN6QyxVQUFJLENBQUMsT0FBTywwQ0FBRSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztTQUN6QztRQUNELElBQUksSUFBSSxDQUFDLHlCQUF5QixLQUFLLElBQUksRUFBRTtZQUN6QyxVQUFJLENBQUMsUUFBUSwwQ0FBRSxjQUFjLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztTQUN6QztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFDTCxzQkFBQztBQUFELENBQUM7QUFFRCx5REFBeUQ7QUFDekQ7SUFJSSxzQkFBWSxPQUFtQixFQUFFLFFBQXlCO1FBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRXpCLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxXQUFDLElBQUUsY0FBTyxDQUFDLFNBQVMsR0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUM7UUFFeEQsT0FBTyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFbkMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0QsOEJBQU8sR0FBUDs7UUFDSSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsS0FBSyxJQUFJLEVBQUU7WUFDekMsVUFBSSxDQUFDLFFBQVEsMENBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztJQUMxQyxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQUFDO0FBRUQsNENBQTRDO0FBQzVDO0lBS0kseUJBQVksT0FBeUIsRUFBRSxRQUE2QjtRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6QixJQUFJLENBQUMseUJBQXlCLEdBQUcsV0FBQyxJQUFFLGVBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUEzQixDQUEyQixDQUFDO1FBQ2hFLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxXQUFDLElBQUUsY0FBTyxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQWYsQ0FBZSxDQUFDO1FBRXBELE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQUk7WUFDbEIsV0FBTyxHQUFXLElBQUksUUFBZixFQUFFLEtBQUssR0FBSSxJQUFJLE1BQVIsQ0FBUztZQUM5QixJQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzVCLGFBQWEsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUUvQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ25FLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELGlDQUFPLEdBQVA7O1FBQ0ksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ3pDLFVBQUksQ0FBQyxPQUFPLDBDQUFFLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUMvRTtRQUNELElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUN6QyxVQUFJLENBQUMsUUFBUSwwQ0FBRSxjQUFjLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDakU7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDO1FBQ3RDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7SUFDMUMsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0FBQztBQUVELDhCQUE4QjtBQUM5QixTQUFnQixZQUFZLENBQUMsZUFBZ0MsRUFBRSxZQUE4QjtJQUN6RixhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDL0IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxlQUFlLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDdEYsQ0FBQztBQUhELG9DQUdDO0FBRUQsaUNBQWlDO0FBQ2pDLFNBQWdCLFlBQVksQ0FBQyxhQUErQixFQUFFLFlBQWlDO0lBQzNGLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3QixRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLGVBQWUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBSEQsb0NBR0M7QUFFRCw2REFBNkQ7QUFDN0QsU0FBZ0IsU0FBUyxDQUFDLE9BQW1CLEVBQUUsUUFBeUI7SUFDcEUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZCLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFIRCw4QkFHQztBQUVELDJDQUEyQztBQUMzQyxTQUFnQixhQUFhLENBQUMsT0FBWTs7SUFDdEMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3ZCLGNBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBDQUFFLE9BQU8sRUFBRSxDQUFDO0tBQ3BDO0lBQ0QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBTEQsc0NBS0M7QUFFRCxJQUFNLFNBQVMsR0FBRztJQUNkLFFBQVE7SUFDUixZQUFZO0lBQ1osWUFBWTtJQUNaLFlBQVk7SUFDWixTQUFTO0lBQ1QsYUFBYTtDQUNoQixDQUFDO0FBRUYsa0JBQWUsU0FBUyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3hMekIsK0VBQTBDO0FBQzFDLG1HQUFtRDtBQVduRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QixTQUFTLFVBQVU7SUFFZixJQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0QjtRQUNJLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsRUFBRSxjQUFjLENBQUM7SUFDakIsT0FBVSxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBSSxHQUFHLENBQUMsUUFBUSxFQUFFLFNBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBSSxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQUksTUFBTSxTQUFJLGNBQWdCLENBQUM7QUFDcEwsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQVk7SUFDMUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsS0FBSyxJQUFJLGtCQUFrQixDQUFDO0lBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUUsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksR0FBRyxJQUFJLEdBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUVDO0lBQUE7SUEwREYsQ0FBQztJQS9DVSxvQkFBVSxHQUFqQixVQUFrQixhQUFvQjtRQUNsQyxRQUFRLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFDbkM7WUFDSSxLQUFLLFdBQVc7Z0JBQ1osT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQy9CLEtBQUssVUFBVTtnQkFDWCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDOUIsS0FBSyxRQUFRO2dCQUNULE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUM1QixLQUFLLE9BQU87Z0JBQ1IsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQzNCLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssVUFBVTtnQkFDWCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDOUI7Z0JBQ0ksT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQUNNLHlCQUFlLEdBQXRCLFVBQXVCLFVBQWlCO1FBQ3BDLFFBQVEsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUNoQztZQUNJLEtBQUssV0FBVztnQkFDWixPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztZQUN2QyxLQUFLLFVBQVU7Z0JBQ1gsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7WUFDdEMsS0FBSyxRQUFRO2dCQUNULE9BQU8sU0FBUyxDQUFDLGNBQWMsQ0FBQztZQUNwQyxLQUFLLE9BQU87Z0JBQ1IsT0FBTyxTQUFTLENBQUMsYUFBYSxDQUFDO1lBQ25DLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssVUFBVTtnQkFDWCxPQUFPLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN0QztnQkFDSSxPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztTQUMxQztJQUNMLENBQUM7SUFFRCxvQkFBb0I7SUFDYixpQkFBTyxHQUFkO1FBQ0ksT0FBTztZQUNILEVBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBQztZQUNsRSxFQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUM7WUFDaEUsRUFBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBQztZQUM1RCxFQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFDO1lBQzFELEVBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBQztTQUNuRSxDQUFDO0lBQ04sQ0FBQztJQXhETSxtQkFBUyxHQUFHLFdBQVcsQ0FBQztJQUN4QixrQkFBUSxHQUFHLFVBQVUsQ0FBQztJQUN0QixnQkFBTSxHQUFHLFFBQVEsQ0FBQztJQUNsQixlQUFLLEdBQUcsT0FBTyxDQUFDO0lBQ2hCLGtCQUFRLEdBQUcsVUFBVSxDQUFDO0lBQ3RCLDJCQUFpQixHQUFHLFdBQVcsQ0FBQztJQUNoQywwQkFBZ0IsR0FBRyxVQUFVLENBQUM7SUFDOUIsd0JBQWMsR0FBRyxRQUFRLENBQUM7SUFDMUIsdUJBQWEsR0FBRyxPQUFPLENBQUM7SUFDeEIsMEJBQWdCLEdBQUcsVUFBVSxDQUFDO0lBZ0R6QyxnQkFBQztDQUFBO0FBMURjLDhCQUFTO0FBMkR4QjtJQUtJO1FBQ0ksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQWMsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHdCQUF3QixFQUFFLENBQUM7SUFDbEQsQ0FBQztJQUNELGVBQWU7SUFDZixpQ0FBSyxHQUFMLFVBQU0sSUFBVztRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUNELHVDQUFXLEdBQVg7UUFDSSxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3JCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDckIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1NBQ3RDLENBQUM7SUFDTixDQUFDO0lBQ0QsbUNBQU8sR0FBUCxjQUFtQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hELHdCQUFDO0FBQUQsQ0FBQztBQTNCWSw4Q0FBaUI7QUE0QjlCO0lBR0k7UUFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsZUFBZTtJQUNmLHdDQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBQ0QsOENBQVcsR0FBWDtRQUNJLE9BQU87WUFDSCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDN0IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1NBQ2hDLENBQUM7SUFDTixDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDO0FBbEJZLDREQUF3QjtBQW1CckM7SUFPSTtRQUNJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFjLElBQUksQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFjLElBQUksQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQVUsSUFBSSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUNELHNDQUFhLEdBQWIsY0FBMkMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUM7SUFDM0Qsd0NBQWUsR0FBZixjQUE2QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztJQUMvRCxnQ0FBTyxHQUFQLGNBQWlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDO0lBQ3pDLGlEQUF3QixHQUF4QixjQUEyRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBQztJQUN0RiwrQ0FBc0IsR0FBdEIsY0FBeUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUM7SUFDbEYsZ0RBQXVCLEdBQXZCLGNBQXFELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0lBQ3ZFLDBDQUFpQixHQUFqQixjQUFnRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBQztJQUN4RSxxQkFBQztBQUFELENBQUM7QUF0Qlksd0NBQWM7QUF1QjNCO0lBU0k7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFVLElBQUksQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFVLEtBQUssQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDakUsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFFMUIsMkJBQTJCO1FBQzNCLGdEQUFnRDtJQUNwRCxDQUFDO0lBQ0QsZUFBZTtJQUNmLDZCQUFLLEdBQUwsVUFBTSxJQUFXO1FBQ2IsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUNELHdDQUFnQixHQUFoQjtRQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBQ0QsdUNBQWUsR0FBZjtRQUNJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0ssOEJBQU0sR0FBWixVQUFhLEtBQVk7OztnQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOzs7S0FDMUM7SUFDSyw0QkFBSSxHQUFWOzs7OzRCQUNXLHFCQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOzRCQUF2QyxzQkFBTyxTQUFnQyxFQUFDOzs7O0tBQzNDO0lBQ0ssNkJBQUssR0FBWDs7Ozs7O3dCQUNVLFFBQVEsR0FBWTs0QkFDdEIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPOzRCQUNyQixLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7NEJBQzdCLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ3BELFVBQVUsRUFBQyxFQUFFOzRCQUNiLEtBQUssRUFBQyxFQUFFOzRCQUNSLGdCQUFnQixFQUFDLEVBQUU7eUJBQ3RCLENBQUM7d0JBQ2UscUJBQU0sS0FBSyxDQUFDLDhDQUE4QyxFQUFFO2dDQUNyRSxNQUFNLEVBQUUsTUFBTTtnQ0FDZCxPQUFPLEVBQUMsRUFBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUM7Z0NBQzVDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzs2QkFDakMsQ0FBQzs7d0JBSkEsUUFBUSxHQUFHLFNBSVg7d0JBQ2UscUJBQU0sUUFBUSxDQUFDLElBQUksRUFBRTs7d0JBQXBDLFlBQVksR0FBRyxTQUFxQjt3QkFDcEMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ3ZDLEtBQUssR0FBSSxZQUFZLE1BQWhCLENBQWlCO3dCQUM3QixJQUFJLEtBQUssRUFBRTs0QkFDUCxNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUMxQjt3QkFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdEIsc0JBQU8sSUFBSSxFQUFDOzs7O0tBQ2Y7SUFDSyw0QkFBSSxHQUFWLFVBQVcsSUFBVzs7Ozs7O3dCQUNaLFFBQVEsR0FBRzs0QkFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87NEJBQ3JCLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzs0QkFDN0IsSUFBSSxFQUFFLElBQUk7eUJBQ2IsQ0FBQzt3QkFDZSxxQkFBTSxLQUFLLENBQUMsOENBQThDLEVBQUU7Z0NBQ3JFLE1BQU0sRUFBRSxNQUFNO2dDQUNkLE9BQU8sRUFBQyxFQUFDLGNBQWMsRUFBRSxrQkFBa0IsRUFBQztnQ0FDNUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDOzZCQUNqQyxDQUFDOzt3QkFKQSxRQUFRLEdBQUcsU0FJWDt3QkFDTixNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Ozs7S0FDMUM7SUFDRCxnQ0FBUSxHQUFSLGNBQXFCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0MsK0JBQU8sR0FBUCxjQUFtQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hELDBDQUFrQixHQUFsQjtRQUNJLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsMENBQWtCLEdBQWxCO1FBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFDTCxvQkFBQztBQUFELENBQUM7QUE3Rlksc0NBQWE7Ozs7Ozs7Ozs7Ozs7O0FDMUoxQixJQUFJLFFBQVEsR0FBcUIsSUFBSSxDQUFDO0FBQ3RDLElBQUksWUFBWSxHQUFxQixJQUFJLENBQUM7QUFFMUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7QUFFbkQsZ0NBQWdDO0FBQ2hDLFNBQVMsVUFBVSxDQUFDLFdBQXVCO0lBQ3ZDLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDNUMsSUFBSSxTQUFTLEVBQUU7UUFDWCxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUNoQztJQUNELFdBQVcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFnQixFQUFFLElBQVUsRUFBRSxZQUFxQixFQUFFLGFBQXVCO0lBQzdGLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxFQUFFLEtBQUs7UUFDekIsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFNLFlBQVksR0FBZ0I7WUFDOUIsT0FBTyxFQUFDLEVBQUU7WUFDVixRQUFRO1lBQ1IsSUFBSTtZQUNKLFFBQVEsRUFBQyxJQUFJO1lBQ2IsWUFBWTtZQUNaLGFBQWE7U0FDaEIsQ0FBQztRQUNGLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFdBQUMsSUFBRSxnQkFBUyxDQUFDLFlBQVksQ0FBQyxFQUF2QixDQUF1QixDQUFDLENBQUM7UUFDeEQsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxXQUFDLElBQUUsZUFBUSxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsV0FBQyxJQUFFLGNBQU8sRUFBRSxFQUFULENBQVMsQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVyQiwyQkFBMkI7UUFDM0IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsSUFBTSxTQUFTLEdBQUcsVUFBQyxZQUF5QjtJQUN4QyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzVCLENBQUMsQ0FBQztBQUVGLElBQU0sUUFBUSxHQUFHLFVBQUMsQ0FBVyxFQUFFLFlBQXlCO0lBQ3BELENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUNuQixZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2hDLENBQUMsQ0FBQztBQUVGLElBQU0sT0FBTyxHQUFHO0lBQ1osSUFBSTtRQUNBLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDNUIsT0FBTztTQUNWO1FBRUcsSUFBUSxjQUFjLEdBTXRCLFFBQVEsUUFOYyxFQUNiLGVBQWUsR0FLeEIsUUFBUSxTQUxnQixFQUNuQixlQUFlLEdBSXBCLFFBQVEsS0FKWSxFQUNYLGVBQWUsR0FHeEIsUUFBUSxTQUhnQixFQUN4QixZQUFZLEdBRVosUUFBUSxhQUZJLEVBQ1osYUFBYSxHQUNiLFFBQVEsY0FESyxDQUNKO1FBRWIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFHO1lBQ2hDLE9BQU87U0FDVjtRQUNELElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUd6RCxJQUFRLGtCQUFrQixHQUUxQixZQUFZLFFBRmMsRUFDckIsbUJBQW1CLEdBQ3hCLFlBQVksS0FEWSxDQUNYO1FBQ2pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ25DLE9BQU87U0FDVjtRQUNELElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELElBQUksZUFBZSxLQUFLLG1CQUFtQixFQUFFO1lBQ3pDLE9BQU87U0FDVjtRQUNELElBQUksU0FBUyxLQUFLLE9BQU8sRUFBRTtZQUN2QixPQUFPO1NBQ1Y7UUFDRCxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyQyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFcEQsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLFdBQVcsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztLQUM5RTtZQUFTO1FBQ04sUUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixZQUFZLEdBQUcsSUFBSSxDQUFDO0tBQ3ZCO0FBQ0wsQ0FBQztBQUVZLGlCQUFTLEdBQUc7SUFDckIsV0FBVztDQUNkOzs7Ozs7Ozs7Ozs7OztBQzNHRCwwQkFBMEI7QUFDMUIsU0FBZ0IsbUJBQW1CLENBQUMsTUFBVztJQUMzQyxPQUFPLE1BQU0sQ0FBQyxVQUFVLEVBQUU7UUFDdEIsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3hDO0tBQ0o7QUFDTCxDQUFDO0FBTkQsa0RBTUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUkQsMkZBQWtEO0FBQ2xELGtGQUF5QztBQUN6QyxrRkFBcUM7QUFDckMsMEdBQXlEO0FBQ3pELGtHQUFxRDtBQUNyRCxvSEFBNEQ7QUFFNUQsSUFBSSxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEQsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFFaEMsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLGNBQTJDO0lBQ3hFLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztJQUV0QztRQUNFLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakQsUUFBUSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDM0IsUUFBUSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7UUFDaEMsb0JBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDckUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzQjtJQUVEO1FBQ0ksSUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxXQUFXLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDO1FBQzlDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsY0FBSSxjQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFyQyxDQUFxQyxDQUFDO1FBQ2hFLG9CQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUNuRSxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hDO0lBRUQ7UUFDSSxJQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7UUFDdkMsRUFBRSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDbkIsRUFBRSxDQUFDLE9BQU8sR0FBRyxjQUFJLGNBQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztRQUNsRCxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZCO0lBRUQ7UUFDSSxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxjQUFJLGNBQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsRUFBbEMsQ0FBa0MsQ0FBQztRQUN0RCxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3pCO0lBRUQ7UUFDSSxJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7UUFDeEMsR0FBRyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDekIsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFJLGNBQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQztRQUN2RCxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDLENBQUM7QUFDRixTQUFTLGVBQWUsQ0FBQyxJQUFTO0lBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGNBQUk7UUFDMUIsb0JBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBQUEsQ0FBQztBQUNGLFNBQVMsbUJBQW1CLENBQUMsQ0FBTztJQUNsQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDaEMsSUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3RFLElBQUksb0JBQW9CLEVBQUU7UUFDeEIsc0JBQVMsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQUUscUJBQXFCLEVBQUUsZUFBZSxDQUFDLENBQUM7S0FDdkg7QUFDSCxDQUFDO0FBQ0QsU0FBUyxRQUFRO0FBRWpCLENBQUM7QUFDRCxTQUFTLGlCQUFpQixDQUFDLElBQStCOzs7UUFDeEQsS0FBdUIsMEJBQUksdUVBQUU7WUFBbEIsa0NBQVEsRUFBUCxFQUFFLFVBQUUsRUFBRTtZQUNoQixJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLElBQUksT0FBTyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDdkM7U0FDRjs7Ozs7Ozs7O0FBQ0gsQ0FBQztBQUVELHNCQUFzQjtBQUN0QixTQUFlLE9BQU87Ozs7d0JBQ2hCLHFCQUFNLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTs7b0JBQXRDLElBQUksU0FBa0MsRUFBRTt3QkFDdEMsYUFBYSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztxQkFDcEM7Ozs7O0NBQ0Y7QUFFRCx1QkFBdUI7QUFDdkIsU0FBZSxRQUFROzs7Ozt3QkFDakIscUJBQU0sUUFBUSxDQUFDLGlCQUFpQixFQUFFOzt5QkFBbEMsU0FBa0MsRUFBbEMsd0JBQWtDO29CQUN2QixxQkFBTSxZQUFZLENBQUMsSUFBSSxFQUFFOztvQkFBaEMsU0FBTyxTQUF5Qjt5QkFDbEMsTUFBSSxFQUFKLHdCQUFJO29CQUNOLHFCQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBSSxDQUFDOztvQkFBOUIsU0FBOEIsQ0FBQzs7Ozs7O0NBR3BDO0FBQ0QsdUJBQXVCO0FBQ3ZCLFNBQWUsUUFBUTs7Ozt3QkFDckIscUJBQU0sYUFBYSxDQUFDLElBQUksRUFBRTs7b0JBQTFCLFNBQTBCLENBQUM7Ozs7O0NBQzVCO0FBQ0QsMEJBQTBCO0FBQzFCLFNBQWUsVUFBVTs7O1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7O0NBQ3hDO0FBRUQsU0FBZSxJQUFJOzs7Ozs7b0JBQ2pCLFFBQVEsQ0FBQyxTQUFTLEdBQUcsV0FBQzt3QkFDbEIsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFOzRCQUNYLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7Z0NBQ25CLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQ0FDbkIsUUFBUSxFQUFFLENBQUM7NkJBQ2Q7eUJBQ0o7b0JBQ0wsQ0FBQztvQkFDRCxpQkFBaUIsQ0FBQzt3QkFDaEIsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQzt3QkFDM0MsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDO3dCQUMxQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQzt3QkFDNUIsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUM7d0JBQzVCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDO3dCQUNoQyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7cUJBQ3pCLENBQUMsQ0FBQzs7OztvQkFHYyxxQkFBTSxZQUFZLENBQUMsSUFBSSxFQUFFOztvQkFBbEMsTUFBTSxHQUFHLFNBQXlCO29CQUNqQyxRQUFRLEdBQVksTUFBTSxTQUFsQixFQUFDLE9BQU8sR0FBSSxNQUFNLFFBQVYsQ0FBVzt5QkFDOUIsUUFBUSxFQUFSLHdCQUFRO29CQUNWLHFCQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDOztvQkFBbEMsU0FBa0MsQ0FBQzs7O29CQUM5QixJQUFJLE9BQU8sRUFBRTt3QkFDbEIsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDOUI7eUJBQU07d0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO3FCQUNqRDs7Ozs7b0JBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQztvQkFDakIsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O29CQUVqQyxvQkFBb0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUNoRSxJQUFJLG9CQUFvQixFQUFFO3dCQUN4QixzQkFBUyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxlQUFlLENBQUMsQ0FBQztxQkFDdkg7Ozs7O0NBQ0Y7QUFBQSxDQUFDO0FBRUYsdUJBQXVCO0FBQ3ZCLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7SUFDckMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3JEO0tBQU07SUFDTCxtQ0FBbUM7SUFDbkMsSUFBSSxFQUFFLENBQUM7Q0FDUjtBQUVELFNBQWdCLFdBQVc7SUFDekIsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQUZELGtDQUVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEpELElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO0FBRWxELDRDQUE0QztBQUM1QyxTQUFTLFVBQVUsQ0FBQyxNQUFrQixFQUFFLE9BQWlCLEVBQUUsTUFBZTtJQUN0RSxJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLElBQUksSUFBSSxFQUFFO1FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQzlCLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxXQUFFLE1BQU0sVUFBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVELHVDQUF1QztBQUN2QyxTQUFlLGNBQWMsQ0FBQyxNQUFrQixFQUFFLFFBQWlCOzs7Ozs7b0JBQzNELEtBQUssR0FBTyxJQUFJLENBQUM7Ozs7b0JBRVQscUJBQU0sUUFBUSxFQUFFOztvQkFBeEIsS0FBSyxHQUFHLFNBQWdCLENBQUM7OztvQkFFekIsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQzs7Ozs7O0NBRWxDO0FBRUQsdUNBQXVDO0FBQ3ZDLFNBQVMsV0FBVyxDQUFDLE1BQWtCLEVBQUUsTUFBVTtJQUMvQyxJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFDdEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBRUQsOEJBQThCO0FBQzlCLFNBQWdCLGFBQWEsQ0FBQyxPQUFtQixFQUFFLGNBQWtCO0lBQ2pFLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUFFLE9BQU87S0FBRTtJQUN4QixJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFDdEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixJQUFJLE1BQU0sWUFBWSxXQUFXLEVBQUU7UUFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0tBQ2pDO0lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBVkQsc0NBVUM7QUFLRCxvQkFBb0I7QUFDcEIsSUFBSTtBQUNKLDhCQUE4QjtBQUM5QiwwREFBMEQ7QUFDMUQsZ0hBQWdIO0FBQ2hILHlHQUF5RztBQUN6RyxpQ0FBaUM7QUFDakMsaUdBQWlHO0FBQ2pHLHVHQUF1RztBQUN2RyxTQUFnQixJQUFJLENBQUMsRUFBUyxFQUFFLElBQWtCLEVBQUUsT0FBbUI7O0lBQXZFLGlCQXVDQztJQXRDRyx5RUFBeUU7SUFDekUsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztJQUNsQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBRTdCLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0MsUUFBUSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQzs0QkFHNUIsS0FBSyxFQUFFLFFBQVE7UUFDdkIsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFOzt3QkFBWSxxQkFBTSxjQUFjLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQzt3QkFBdEMsK0JBQXNDOztpQkFBQSxDQUFFLENBQUM7UUFDbkYsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdEIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O1FBTDlCLGlCQUFpQjtRQUNqQixLQUFnQyxnQ0FBTztZQUE1QiwwQkFBaUIsRUFBaEIsS0FBSyxhQUFFLFFBQVE7b0JBQWYsS0FBSyxFQUFFLFFBQVE7U0FLMUI7Ozs7Ozs7Ozs7UUFFRCwyQkFBMkI7UUFDM0IsS0FBc0IsMEJBQUksdUVBQUU7WUFBdkIsSUFBTSxPQUFPO1lBQ2QsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM1Qjs7Ozs7Ozs7O0lBRUQsc0JBQXNCO0lBQ3RCLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFMUIsK0JBQStCO0lBQy9CLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbEMsNEJBQTRCO0lBQzVCLElBQU0sS0FBSyxHQUFxQjtRQUM1QixjQUFNLFdBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sSUFBRyxpQkFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQW5DLENBQW1DLENBQUMsRUFBbkUsQ0FBbUU7UUFDekUsVUFBQyxNQUFXLElBQUssa0JBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQTNCLENBQTJCO0tBQy9DLENBQUM7SUFDRixPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBdkNELG9CQXVDQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkdELGtEQUFrRDtBQUNsRCxnRkFBd0M7QUFFeEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLElBQUksTUFBTSxHQUF3QixJQUFJLENBQUM7QUFDdkMsSUFBSSxPQUFPLEdBQXlCLElBQUksQ0FBQztBQUV6Qyw4QkFBOEI7QUFDOUIsU0FBUyxJQUFJOztJQUNULElBQUksT0FBTyxFQUFFO1FBQUUsT0FBTztLQUFFO0lBQ3hCLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFFZixJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBRTlCLFlBQW9CLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQS9ELE1BQU0sVUFBRSxPQUFPLFNBQWlEO0FBQ3JFLENBQUM7QUFFRCwrQ0FBK0M7QUFDL0MsU0FBc0IsSUFBSSxDQUFJLFdBQXNCOzs7OztvQkFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFBRSxJQUFJLEVBQUUsQ0FBQztxQkFBRTtvQkFFekIsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFBQyxNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FCQUFDO29CQUM1QyxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQUM7b0JBRTlDLHdCQUF3QjtvQkFDeEIsTUFBTSxFQUFFLENBQUM7Ozs7b0JBRUUscUJBQU0sV0FBVzt3QkFBeEIsc0JBQU8sU0FBaUIsRUFBQzs7b0JBRXpCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0NBRXJCO0FBYkQsb0JBYUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hDRCxrREFBa0Q7QUFDbEQsZ0ZBQXdDO0FBQ3hDLDhGQUFpRDtBQUVqRCxJQUFJLE9BQU8sR0FBVyxLQUFLLENBQUM7QUFDNUIsSUFBSSxNQUFNLEdBQXdCLElBQUksQ0FBQztBQUN2QyxJQUFJLE9BQU8sR0FBeUIsSUFBSSxDQUFDO0FBRXpDLHVDQUF1QztBQUN2QyxTQUFlLFlBQVk7Ozs7O3dCQUNSLHFCQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUU7O29CQUFsQyxNQUFNLEdBQUcsU0FBeUI7eUJBRXBDLENBQUMsTUFBTSxFQUFQLHdCQUFPO29CQUNBLHFCQUFNLElBQUksRUFBRTt3QkFBbkIsc0JBQU8sU0FBWSxFQUFDO3dCQUV4QixzQkFBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLEVBQUMsRUFBQzs7OztDQUM1QjtBQUVELG1DQUFtQztBQUNuQyxTQUFTLFNBQVM7SUFDZCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBQyxPQUFPLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRUQsOEJBQThCO0FBQzlCLFNBQVMsSUFBSTs7SUFDVCxJQUFJLE9BQU8sRUFBRTtRQUFFLE9BQU87S0FBRTtJQUN4QixPQUFPLEdBQUcsSUFBSSxDQUFDO0lBRWYsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsU0FBUyxHQUFHLCtEQUErRCxDQUFDO0lBRXBGLElBQU0sT0FBTyxHQUF3QjtRQUNqQyxFQUFDLEtBQUssRUFBQyxlQUFlLEVBQUUsUUFBUSxFQUFDLFlBQVksRUFBQztRQUM5QyxFQUFDLEtBQUssRUFBQyxZQUFZLEVBQUUsUUFBUSxFQUFDLFNBQVMsRUFBQztLQUMzQyxDQUFDO0lBQ0YsWUFBb0IsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBcEUsTUFBTSxVQUFFLE9BQU8sU0FBc0Q7QUFDMUUsQ0FBQztBQUVELG1GQUFtRjtBQUNuRixtRUFBbUU7QUFDbkUsc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixTQUFzQixJQUFJOzs7OztvQkFDdEIsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFBRSxJQUFJLEVBQUUsQ0FBQztxQkFBRTtvQkFDekIsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFBRSxzQkFBTztxQkFBRTtvQkFDakIscUJBQU0sTUFBTSxFQUFFO3dCQUFyQixzQkFBTyxTQUFjLEVBQUM7Ozs7Q0FDekI7QUFKRCxvQkFJQztBQUVELHVCQUF1QjtBQUN2QixTQUFnQixLQUFLLENBQUMsTUFBVTtJQUM1QixJQUFJLENBQUMsT0FBTyxFQUFFO1FBQUUsT0FBTztLQUFFO0lBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBSEQsc0JBR0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcERELHNDQUFzQztBQUN0QyxnRkFBd0M7QUFDeEMsMkVBQXNDO0FBRXRDLElBQUksT0FBTyxHQUFXLEtBQUssQ0FBQztBQUM1QixJQUFJLE1BQU0sR0FBd0IsSUFBSSxDQUFDO0FBQ3ZDLElBQUksT0FBTyxHQUF5QixJQUFJLENBQUM7QUFDekMsSUFBSSxXQUFXLEdBQW9CLElBQUksQ0FBQztBQUV4Qyx3QkFBd0I7QUFDeEIsU0FBUyxhQUFhO0lBQ2xCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsOEJBQThCO0FBQzlCLFNBQVMsSUFBSTs7SUFDVCxJQUFJLE9BQU8sRUFBRTtRQUFFLE9BQU87S0FBRTtJQUN4QixPQUFPLEdBQUcsSUFBSSxDQUFDO0lBRWYsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsU0FBUyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3ZELFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO0lBRXhDLElBQU0sT0FBTyxHQUF3QixDQUFDLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQztJQUNoRixZQUFvQixRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBN0UsTUFBTSxVQUFFLE9BQU8sU0FBK0Q7QUFDbkYsQ0FBQztBQUVELHdCQUF3QjtBQUN4QixTQUFTLGtCQUFrQixDQUFDLFFBQWlCOztJQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQUMsT0FBTztLQUFDO0lBQzNCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3ZCLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztRQUNuQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pDO1NBQU07Z0NBQ1EsTUFBSTtZQUNYLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxXQUFDLElBQUUsZUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBSSxDQUFDLEVBQXJDLENBQXFDLENBQUMsQ0FBQztZQUM1RSxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQUksQ0FBQztZQUN6QixXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7WUFKckMsS0FBbUIsa0NBQVE7Z0JBQXRCLElBQU0sTUFBSTt3QkFBSixNQUFJO2FBS2Q7Ozs7Ozs7OztLQUNKO0FBQ0wsQ0FBQztBQUVELG1GQUFtRjtBQUNuRixrRkFBa0Y7QUFDbEYsU0FBc0IsSUFBSTs7Ozs7O29CQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUFFLElBQUksRUFBRSxDQUFDO3FCQUFFO29CQUN6QixJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUFFLHNCQUFPO3FCQUFFO29CQUVQLHFCQUFNLEtBQUssQ0FBQyw4Q0FBOEMsRUFBRTs0QkFDckUsTUFBTSxFQUFFLE1BQU07NEJBQ2QsT0FBTyxFQUFDLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFDO3lCQUMvQyxDQUFDOztvQkFIQSxRQUFRLEdBQUcsU0FHWDtvQkFDZSxxQkFBTSxRQUFRLENBQUMsSUFBSSxFQUFFOztvQkFBcEMsWUFBWSxHQUFHLFNBQXFCO29CQUNwQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDdkMsS0FBSyxHQUFVLFlBQVksTUFBdEIsRUFBQyxLQUFLLEdBQUksWUFBWSxNQUFoQixDQUFpQjtvQkFDbkMsSUFBSSxLQUFLLEVBQUU7d0JBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDMUI7b0JBQ0Qsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ25CLHFCQUFNLE1BQU0sRUFBRTt3QkFBckIsc0JBQU8sU0FBYyxFQUFDOzs7O0NBQ3pCO0FBaEJELG9CQWdCQztBQUVELHVCQUF1QjtBQUN2QixTQUFnQixLQUFLLENBQUMsTUFBVTtJQUM1QixJQUFJLENBQUMsT0FBTyxFQUFFO1FBQUUsT0FBTztLQUFFO0lBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBSEQsc0JBR0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZFRCw4RUFBMEM7QUFDMUMsZ0ZBQXdDO0FBRXhDLElBQUksT0FBTyxHQUFXLEtBQUssQ0FBQztBQUM1QixJQUFJLE1BQU0sR0FBbUIsY0FBSSxjQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFyQixDQUFxQixDQUFDO0FBQ3ZELElBQUksT0FBTyxHQUFvQixXQUFDLElBQUcsQ0FBQyxDQUFDO0FBRXJDLFNBQVMsb0JBQW9CO0FBRTdCLENBQUM7QUFDRCxTQUFTLGdCQUFnQjtBQUV6QixDQUFDO0FBRUQsOENBQThDO0FBQzlDLFNBQWdCLFFBQVEsQ0FBQyxNQUFhO0lBQ2xDLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsSUFBTSxNQUFNLEdBQUksU0FBUztTQUNwQixXQUFXLEVBQUU7U0FDYixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsSUFBSSxNQUFNLEVBQUU7UUFDUixvQkFBb0IsRUFBRSxDQUFDO0tBQzFCO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQVRELDRCQVNDO0FBRUQsU0FBc0IsTUFBTTs7Ozs7O29CQUN4QixnQkFBZ0IsRUFBRSxDQUFDO29CQUNKLHFCQUFNLFNBQVM7NkJBQ3pCLFdBQVcsRUFBRTs2QkFDYixJQUFJLEVBQUU7O29CQUZMLE1BQU0sR0FBRyxTQUVKO29CQUNYLElBQUksTUFBTSxFQUFFO3dCQUNSLG9CQUFvQixFQUFFLENBQUM7cUJBQzFCO29CQUNELHNCQUFPLE1BQU0sRUFBQzs7OztDQUNqQjtBQVRELHdCQVNDO0FBRUQsU0FBZSxjQUFjOzs7O3dCQUNsQixxQkFBTSxNQUFNLEVBQUU7d0JBQXJCLHNCQUFPLFNBQWMsRUFBQzs7OztDQUN6QjtBQUVELFNBQWUsaUJBQWlCOzs7WUFDNUIsc0JBQU8sSUFBSSxFQUFDOzs7Q0FDZjtBQUVELFNBQWUsZ0JBQWdCOzs7WUFDM0Isc0JBQU8sS0FBSyxFQUFDOzs7Q0FDaEI7QUFFRCwyQkFBMkI7QUFDM0IsU0FBZ0IsSUFBSTs7SUFDaEIsSUFBSSxPQUFPLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFDeEIsT0FBTyxHQUFHLElBQUksQ0FBQztJQUVmLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0MsT0FBTyxDQUFDLFNBQVMsR0FBRyx1RUFBdUUsQ0FBQztJQUU1RixJQUFNLE9BQU8sR0FBRztRQUNaLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsY0FBYyxFQUFDO1FBQ3ZDLEVBQUMsS0FBSyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUMsaUJBQWlCLEVBQUM7UUFDN0MsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxnQkFBZ0IsRUFBQztLQUM5QyxDQUFDO0lBQ0YsWUFBb0IsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBL0QsTUFBTSxVQUFFLE9BQU8sU0FBaUQ7QUFDckUsQ0FBQztBQWJELG9CQWFDO0FBRUQsb0dBQW9HO0FBQ3BHLFNBQXNCLGlCQUFpQjs7Ozs7O29CQUNuQyxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUFFLElBQUksRUFBRSxDQUFDO3FCQUFFO29CQUNuQixhQUFhLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO3lCQUMxQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQXhCLHdCQUF3QjtvQkFDakIscUJBQU0sTUFBTSxFQUFFO3dCQUFyQixzQkFBTyxTQUFjLEVBQUM7d0JBRTFCLHNCQUFPLElBQUksRUFBQzs7OztDQUNmO0FBUEQsOENBT0M7QUFBQSxDQUFDO0FBRUYsdUJBQXVCO0FBQ3ZCLFNBQWdCLEtBQUssQ0FBQyxNQUFVO0lBQzVCLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFIRCxzQkFHQzs7Ozs7OztVQy9FRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VDdEJBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInR5cGUgUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcjxUPiA9ICh2YWx1ZTpUKT0+dm9pZDtcclxuXHJcbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eTxUPiB7XHJcbiAgICB2YWx1ZTpUO1xyXG4gICAgbGlzdGVuZXJzOlByb3BlcnR5Q2hhbmdlTGlzdGVuZXI8VD5bXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZTpUKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XHJcbiAgICB9XHJcbiAgICBzZXQodmFsdWU6VCkge1xyXG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX25vdGlmeUxpc3RlbmVycygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuICAgIGFkZExpc3RlbmVyKGNiOlByb3BlcnR5Q2hhbmdlTGlzdGVuZXI8VD4pIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNiKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUxpc3RlbmVyKGNiOlByb3BlcnR5Q2hhbmdlTGlzdGVuZXI8VD4pIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmZpbHRlcihpPT5pIT09Y2IpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlQWxsTGlzdGVuZXJzKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XHJcbiAgICB9XHJcbiAgICBfbm90aWZ5TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIGNvbnN0IGJhY2t1cCA9IHRoaXMubGlzdGVuZXJzLmNvbmNhdCgpO1xyXG4gICAgICAgIGJhY2t1cC5mb3JFYWNoKGNiPT5jYih0aGlzLnZhbHVlKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbnR5cGUgRGlzcGxheVZhbHVlUGFpcjxWYWx1ZVR5cGU+ID0ge2Rpc3BsYXk6c3RyaW5nLHZhbHVlOlZhbHVlVHlwZX07XHJcbnR5cGUgRGlzcGxheVZhbHVlUGFpcnM8VmFsdWVUeXBlPiA9IERpc3BsYXlWYWx1ZVBhaXI8VmFsdWVUeXBlPltdO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVudW1Qcm9wZXJ0eTxWYWx1ZVR5cGU+IGV4dGVuZHMgUHJvcGVydHk8VmFsdWVUeXBlPiB7XHJcbiAgICBvcHRpb25zOkRpc3BsYXlWYWx1ZVBhaXJzPFZhbHVlVHlwZT47XHJcblxyXG4gICAgY29uc3RydWN0b3IodmFsdWU6VmFsdWVUeXBlLCBkaXNwbGF5VmFsdWVQYWlyczpEaXNwbGF5VmFsdWVQYWlyczxWYWx1ZVR5cGU+KSB7XHJcbiAgICAgICAgc3VwZXIodmFsdWUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IGRpc3BsYXlWYWx1ZVBhaXJzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLy8gY2VudHJhbCBhdXRob3JpdHkgb24gYmluZGluZ3NcclxuY29uc3QgYmluZGluZ3MgPSBuZXcgTWFwPE5vZGUsIEJpbmRpbmc+KCk7XHJcbnR5cGUgQW55UHJvcGVydHk8VmFsdWVUeXBlPiA9IFByb3BlcnR5PFZhbHVlVHlwZT4gfCBFbnVtUHJvcGVydHk8VmFsdWVUeXBlPjtcclxudHlwZSBCaW5kaW5nID0gQ2hlY2tib3hCaW5kaW5nIHwgTGFiZWxCaW5kaW5nIHwgQ29tYm9Cb3hCaW5kaW5nO1xyXG5cclxuLy8vIGJpbmRpbmdzIGZvciBhIGNoZWNrYm94XHJcbmNsYXNzIENoZWNrYm94QmluZGluZyB7XHJcbiAgICBlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnR8bnVsbDtcclxuICAgIHByb3BlcnR5OlByb3BlcnR5PGJvb2xlYW4+fG51bGw7XHJcbiAgICBzeW5jRnJvbUVsZW1lbnRUb1Byb3BlcnR5OigoXzpFdmVudCk9PnZvaWQpIHwgbnVsbDtcclxuICAgIHN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQ6KCh2OmJvb2xlYW4pPT52b2lkKSB8IG51bGw7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxJbnB1dEVsZW1lbnQsIHByb3BlcnR5OkFueVByb3BlcnR5PGJvb2xlYW4+KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zeW5jRnJvbUVsZW1lbnRUb1Byb3BlcnR5ID0gXz0+cHJvcGVydHkuc2V0KGVsZW1lbnQuY2hlY2tlZCk7XHJcbiAgICAgICAgdGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50ID0gdj0+ZWxlbWVudC5jaGVja2VkPXY7XHJcblxyXG4gICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSk7XHJcbiAgICAgICAgcHJvcGVydHkuYWRkTGlzdGVuZXIodGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50KTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQ/LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eT8ucmVtb3ZlTGlzdGVuZXIodGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnByb3BlcnR5ID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLy8vIE9ORSBXQVkgYmluZGluZyBmb3IgZGlzcGxheWluZyBzb21ldGhpbmcgaW4gaW5uZXJUZXh0XHJcbmNsYXNzIExhYmVsQmluZGluZyB7XHJcbiAgICBlbGVtZW50OkhUTUxFbGVtZW50IHwgbnVsbDtcclxuICAgIHByb3BlcnR5OlByb3BlcnR5PHN0cmluZz58bnVsbDtcclxuICAgIHN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQ6KCh2OnN0cmluZyk9PnZvaWQpIHwgbnVsbDtcclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQsIHByb3BlcnR5OlByb3BlcnR5PHN0cmluZz4pIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQgPSB2PT5lbGVtZW50LmlubmVyVGV4dD12O1xyXG5cclxuICAgICAgICBlbGVtZW50LmlubmVyVGV4dCA9IHByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgICBwcm9wZXJ0eS5hZGRMaXN0ZW5lcih0aGlzLnN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHk/LnJlbW92ZUxpc3RlbmVyKHRoaXMuc3luY0Zyb21Qcm9wZXJ0eVRvRWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5wcm9wZXJ0eSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50ID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLy8vIGJpbmRpbmdzIGZvciBhIENvbWJvQm94IGFuZCBFbnVtUHJvcGVydHlcclxuY2xhc3MgQ29tYm9Cb3hCaW5kaW5ne1xyXG4gICAgZWxlbWVudDpIVE1MU2VsZWN0RWxlbWVudCB8IG51bGw7XHJcbiAgICBwcm9wZXJ0eTpFbnVtUHJvcGVydHk8c3RyaW5nPnxudWxsO1xyXG4gICAgc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eTooKF86RXZlbnQpPT52b2lkKSB8IG51bGw7XHJcbiAgICBzeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50OigodjpzdHJpbmcpPT52b2lkKSB8IG51bGw7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxTZWxlY3RFbGVtZW50LCBwcm9wZXJ0eTpFbnVtUHJvcGVydHk8c3RyaW5nPikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSA9IF89PnByb3BlcnR5LnNldChlbGVtZW50LnZhbHVlKTtcclxuICAgICAgICB0aGlzLnN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQgPSB2PT5lbGVtZW50LnZhbHVlPXY7XHJcblxyXG4gICAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gJyc7XHJcbiAgICAgICAgcHJvcGVydHkub3B0aW9ucy5mb3JFYWNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7ZGlzcGxheSwgdmFsdWV9ID0gZGF0YTtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICBvcHRpb25FbGVtZW50LnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIG9wdGlvbkVsZW1lbnQuaW5uZXJUZXh0ID0gZGlzcGxheTtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb25FbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IHByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSk7XHJcbiAgICAgICAgcHJvcGVydHkuYWRkTGlzdGVuZXIodGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50KTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKG51bGwgIT09IHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQ/LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuc3luY0Zyb21FbGVtZW50VG9Qcm9wZXJ0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChudWxsICE9PSB0aGlzLnN5bmNGcm9tUHJvcGVydHlUb0VsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eT8ucmVtb3ZlTGlzdGVuZXIodGhpcy5zeW5jRnJvbVByb3BlcnR5VG9FbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnByb3BlcnR5ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnN5bmNGcm9tRWxlbWVudFRvUHJvcGVydHkgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3luY0Zyb21Qcm9wZXJ0eVRvRWxlbWVudCA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vLyBiaW5kIGNoZWNrYm94IHRvIHNvbWUgZGF0YVxyXG5leHBvcnQgZnVuY3Rpb24gYmluZENoZWNrYm94KGNoZWNrYm94RWxlbWVudDpIVE1MSW5wdXRFbGVtZW50LCBib29sUHJvcGVydHk6UHJvcGVydHk8Ym9vbGVhbj4pIHtcclxuICAgIHVuYmluZEVsZW1lbnQoY2hlY2tib3hFbGVtZW50KTtcclxuICAgIGJpbmRpbmdzLnNldChjaGVja2JveEVsZW1lbnQsIG5ldyBDaGVja2JveEJpbmRpbmcoY2hlY2tib3hFbGVtZW50LCBib29sUHJvcGVydHkpKTtcclxufVxyXG5cclxuLy8vIGJpbmQgQ29tYm9Cb3ggdG8gRW51bVByb3BlcnR5XHJcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ29tYm9Cb3goc2VsZWN0RWxlbWVudDpIVE1MU2VsZWN0RWxlbWVudCwgZW51bVByb3BlcnR5OkVudW1Qcm9wZXJ0eTxzdHJpbmc+KSB7XHJcbiAgICB1bmJpbmRFbGVtZW50KHNlbGVjdEVsZW1lbnQpO1xyXG4gICAgYmluZGluZ3Muc2V0KHNlbGVjdEVsZW1lbnQsIG5ldyBDb21ib0JveEJpbmRpbmcoc2VsZWN0RWxlbWVudCwgZW51bVByb3BlcnR5KSk7XHJcbn1cclxuXHJcbi8vLyBPTkUgV0FZISBiaW5kaW5nIG9mIGFuIGVsZW1lbnQncyAuaW5uZXJUZXh0IHRvIGEgUHJvcGVydHlcclxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRMYWJlbChlbGVtZW50OkhUTUxFbGVtZW50LCBwcm9wZXJ0eTpQcm9wZXJ0eTxzdHJpbmc+KSB7XHJcbiAgICB1bmJpbmRFbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgYmluZGluZ3Muc2V0KGVsZW1lbnQsIG5ldyBMYWJlbEJpbmRpbmcoZWxlbWVudCwgcHJvcGVydHkpKTtcclxufVxyXG5cclxuLy8vIGNsZWFyIGVsZW1lbnQncyBjdXJyZW50IGJpbmRpbmcsIGlmIGFueVxyXG5leHBvcnQgZnVuY3Rpb24gdW5iaW5kRWxlbWVudChlbGVtZW50Ok5vZGUpIHtcclxuICAgIGlmIChiaW5kaW5ncy5oYXMoZWxlbWVudCkpIHtcclxuICAgICAgICBiaW5kaW5ncy5nZXQoZWxlbWVudCk/LmRlc3Ryb3koKTtcclxuICAgIH1cclxuICAgIGJpbmRpbmdzLmRlbGV0ZShlbGVtZW50KTtcclxufVxyXG5cclxuY29uc3QgQmxvb2RCaW5kID0ge1xyXG4gICAgUHJvcGVydHksXHJcbiAgICBFbnVtUHJvcGVydHksXHJcbiAgICBiaW5kQ2hlY2tib3gsXHJcbiAgICBiaW5kQ29tYm9Cb3gsXHJcbiAgICBiaW5kTGFiZWwsXHJcbiAgICB1bmJpbmRFbGVtZW50XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCbG9vZEJpbmQ7IiwiaW1wb3J0ICogYXMgQmxvb2RCaW5kIGZyb20gJy4vYmxvb2QtYmluZCc7XHJcbmltcG9ydCAqIGFzIExvYWREbGcgZnJvbSAnLi9kbGcvYmxvb2QtbG9hZGluZy1kbGcnO1xyXG5cclxudHlwZSBTYXZlRGF0YSA9IHtcclxuICAgIGJsb29kSWQ6c3RyaW5nLFxyXG4gICAgY2hlY2s6bnVtYmVyLFxyXG4gICAgJ21ldGEuanNvbic6c3RyaW5nLFxyXG4gICAgc3JjX2ltYWdlczp7W2tleTpzdHJpbmddOnN0cmluZ30sXHJcbiAgICByb2xlczp7W2tleTpzdHJpbmddOnN0cmluZ30sXHJcbiAgICBwcm9jZXNzZWRfaW1hZ2VzOntba2V5OnN0cmluZ106c3RyaW5nfSxcclxufTtcclxuXHJcbmxldCBibG9vZElkQ291bnRlciA9IC0xO1xyXG5mdW5jdGlvbiBnZW5CbG9vZElkKClcclxue1xyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIGxldCByYW5kb20gPSAnJztcclxuICAgIGZvciAobGV0IGk9MDsgaTw0OyArK2kpXHJcbiAgICB7XHJcbiAgICAgICAgcmFuZG9tICs9IChNYXRoLnJhbmRvbSgpKjE2fDApLnRvU3RyaW5nKDE2KTtcclxuICAgIH1cclxuICAgICsrYmxvb2RJZENvdW50ZXI7XHJcbiAgICByZXR1cm4gYCR7bm93LmdldEZ1bGxZZWFyKCl9LiR7bm93LmdldE1vbnRoKCl9LiR7bm93LmdldERhdGUoKX0uJHtub3cuZ2V0SG91cnMoKX0uJHtub3cuZ2V0TWludXRlcygpfS4ke25vdy5nZXRTZWNvbmRzKCl9LiR7bm93LmdldE1pbGxpc2Vjb25kcygpfS4ke3JhbmRvbX0uJHtibG9vZElkQ291bnRlcn1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNoRnVuYyhpbnB1dDpzdHJpbmcpIHtcclxuICAgIGxldCBoYXNoID0gMDtcclxuICAgIGlucHV0ICs9ICc7IFNvIHNheSB3ZSBhbGwuJztcclxuICAgIGZvciAodmFyIGk9MDsgaTxpbnB1dC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGNvbnN0IGNoYXIgPSBpbnB1dC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIGhhc2ggPSAoKGhhc2g8PDUpLWhhc2gpICsgY2hhcjtcclxuICAgICAgICBoYXNoID0gaGFzaHwwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhhc2g7XHJcbn1cclxuXHJcbiAgZXhwb3J0IGNsYXNzIEJsb29kVGVhbSB7XHJcbiAgICBzdGF0aWMgVE9XTlNGT0xLID0gJ3Rvd25zZm9sayc7XHJcbiAgICBzdGF0aWMgT1VUU0lERVIgPSAnb3V0c2lkZXInO1xyXG4gICAgc3RhdGljIE1JTklPTiA9ICdtaW5pb24nO1xyXG4gICAgc3RhdGljIERFTU9OID0gJ2RlbW9uJztcclxuICAgIHN0YXRpYyBUUkFWRUxFUiA9ICd0cmF2ZWxlcic7XHJcbiAgICBzdGF0aWMgVE9XTlNGT0xLX0RJU1BMQVkgPSAnVG93bnNmb2xrJztcclxuICAgIHN0YXRpYyBPVVRTSURFUl9ESVNQTEFZID0gJ091dHNpZGVyJztcclxuICAgIHN0YXRpYyBNSU5JT05fRElTUExBWSA9ICdNaW5pb24nO1xyXG4gICAgc3RhdGljIERFTU9OX0RJU1BMQVkgPSAnRGVtb24nO1xyXG4gICAgc3RhdGljIFRSQVZFTEVSX0RJU1BMQVkgPSAnVHJhdmVsZXInO1xyXG4gICAgc3RhdGljIHRvSWRTdHJpbmcoZGlzcGxheVN0cmluZzpzdHJpbmcpIHtcclxuICAgICAgICBzd2l0Y2ggKGRpc3BsYXlTdHJpbmcudG9Mb3dlckNhc2UoKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0b3duc2ZvbGtcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCbG9vZFRlYW0uVE9XTlNGT0xLO1xyXG4gICAgICAgICAgICBjYXNlIFwib3V0c2lkZXJcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCbG9vZFRlYW0uT1VUU0lERVI7XHJcbiAgICAgICAgICAgIGNhc2UgXCJtaW5pb25cIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCbG9vZFRlYW0uTUlOSU9OO1xyXG4gICAgICAgICAgICBjYXNlIFwiZGVtb25cIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCbG9vZFRlYW0uREVNT047XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0cmF2ZWxsZXJcIjpcclxuICAgICAgICAgICAgY2FzZSBcInRyYXZlbGVyXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmxvb2RUZWFtLlRSQVZFTEVSO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJsb29kVGVhbS5UT1dOU0ZPTEs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIHRvRGlzcGxheVN0cmluZyh0ZWFtU3RyaW5nOnN0cmluZykge1xyXG4gICAgICAgIHN3aXRjaCAodGVhbVN0cmluZy50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSBcInRvd25zZm9sa1wiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJsb29kVGVhbS5UT1dOU0ZPTEtfRElTUExBWTtcclxuICAgICAgICAgICAgY2FzZSBcIm91dHNpZGVyXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmxvb2RUZWFtLk9VVFNJREVSX0RJU1BMQVk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJtaW5pb25cIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCbG9vZFRlYW0uTUlOSU9OX0RJU1BMQVk7XHJcbiAgICAgICAgICAgIGNhc2UgXCJkZW1vblwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJsb29kVGVhbS5ERU1PTl9ESVNQTEFZO1xyXG4gICAgICAgICAgICBjYXNlIFwidHJhdmVsbGVyXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0cmF2ZWxlclwiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJsb29kVGVhbS5UUkFWRUxFUl9ESVNQTEFZO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJsb29kVGVhbS5UT1dOU0ZPTEtfRElTUExBWTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8vIHtkaXNwbGF5LCB2YWx1ZX1cclxuICAgIHN0YXRpYyBvcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHtkaXNwbGF5OiBCbG9vZFRlYW0uVE9XTlNGT0xLX0RJU1BMQVksIHZhbHVlOiBCbG9vZFRlYW0uVE9XTlNGT0xLfSxcclxuICAgICAgICAgICAge2Rpc3BsYXk6IEJsb29kVGVhbS5PVVRTSURFUl9ESVNQTEFZLCB2YWx1ZTogQmxvb2RUZWFtLk9VVFNJREVSfSxcclxuICAgICAgICAgICAge2Rpc3BsYXk6IEJsb29kVGVhbS5NSU5JT05fRElTUExBWSwgdmFsdWU6IEJsb29kVGVhbS5NSU5JT059LFxyXG4gICAgICAgICAgICB7ZGlzcGxheTogQmxvb2RUZWFtLkRFTU9OX0RJU1BMQVksIHZhbHVlOiBCbG9vZFRlYW0uREVNT059LFxyXG4gICAgICAgICAgICB7ZGlzcGxheTogQmxvb2RUZWFtLlRSQVZFTEVSX0RJU1BMQVksIHZhbHVlOiBCbG9vZFRlYW0uVFJBVkVMRVJ9XHJcbiAgICAgICAgXTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQmxvb2REb2N1bWVudE1ldGEge1xyXG4gICAgcHJpdmF0ZSBuYW1lOiBCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nPjtcclxuICAgIHByaXZhdGUgYXV0aG9yOiBCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nPjtcclxuICAgIHByaXZhdGUgbG9nbzogQmxvb2RCaW5kLlByb3BlcnR5PHN0cmluZ3xudWxsPjtcclxuICAgIHByaXZhdGUgYWxtYW5hYzogQmxvb2REb2N1bWVudE1ldGFBbG1hbmFjO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmV3IEJsb29kQmluZC5Qcm9wZXJ0eSgnTmV3IEVkaXRpb24nKTtcclxuICAgICAgICB0aGlzLmF1dGhvciA9IG5ldyBCbG9vZEJpbmQuUHJvcGVydHkoJycpO1xyXG4gICAgICAgIHRoaXMubG9nbyA9IG5ldyBCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nfG51bGw+KG51bGwpO1xyXG4gICAgICAgIHRoaXMuYWxtYW5hYyA9IG5ldyBCbG9vZERvY3VtZW50TWV0YUFsbWFuYWMoKTtcclxuICAgIH1cclxuICAgIC8vLyBERVNUUlVDVElWRVxyXG4gICAgcmVzZXQobmFtZTpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hbWUuc2V0KG5hbWUpO1xyXG4gICAgICAgIHRoaXMuYXV0aG9yLnNldCgnJyk7XHJcbiAgICAgICAgdGhpcy5sb2dvLnNldChudWxsKTtcclxuICAgICAgICB0aGlzLmFsbWFuYWMucmVzZXQoKTtcclxuICAgIH1cclxuICAgIGdldFNhdmVEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZS5nZXQoKSxcclxuICAgICAgICAgICAgYXV0aG9yOiB0aGlzLmF1dGhvci5nZXQoKSxcclxuICAgICAgICAgICAgbG9nbzogdGhpcy5sb2dvLmdldCgpLFxyXG4gICAgICAgICAgICBhbG1hbmFjOiB0aGlzLmFsbWFuYWMuZ2V0U2F2ZURhdGEoKSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZ2V0TmFtZSgpOnN0cmluZyB7IHJldHVybiB0aGlzLm5hbWUuZ2V0KCk7IH1cclxufVxyXG5leHBvcnQgY2xhc3MgQmxvb2REb2N1bWVudE1ldGFBbG1hbmFjIHtcclxuICAgIHByaXZhdGUgc3lub3BzaXM6IEJsb29kQmluZC5Qcm9wZXJ0eTxzdHJpbmc+O1xyXG4gICAgcHJpdmF0ZSBvdmVydmlldzogQmxvb2RCaW5kLlByb3BlcnR5PHN0cmluZz47XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnN5bm9wc2lzID0gbmV3IEJsb29kQmluZC5Qcm9wZXJ0eSgnJyk7XHJcbiAgICAgICAgdGhpcy5vdmVydmlldyA9IG5ldyBCbG9vZEJpbmQuUHJvcGVydHkoJycpO1xyXG4gICAgfVxyXG4gICAgLy8vIERFU1RSVUNUSVZFXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLnN5bm9wc2lzLnNldCgnJyk7XHJcbiAgICAgICAgdGhpcy5vdmVydmlldy5zZXQoJycpO1xyXG4gICAgfVxyXG4gICAgZ2V0U2F2ZURhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3lub3BzaXM6IHRoaXMuc3lub3BzaXMuZ2V0KCksXHJcbiAgICAgICAgICAgIG92ZXJ2aWV3OiB0aGlzLm92ZXJ2aWV3LmdldCgpLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJsb29kQ2hhcmFjdGVyIHtcclxuICAgIHByaXZhdGUgaWQ6IEJsb29kQmluZC5Qcm9wZXJ0eTxzdHJpbmc+O1xyXG4gICAgcHJpdmF0ZSBuYW1lOiBCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nPjtcclxuICAgIHByaXZhdGUgdW5TdHlsZWRJbWFnZTogQmxvb2RCaW5kLlByb3BlcnR5PHN0cmluZ3xudWxsPjtcclxuICAgIHByaXZhdGUgc3R5bGVkSW1hZ2U6IEJsb29kQmluZC5Qcm9wZXJ0eTxzdHJpbmd8bnVsbD47XHJcbiAgICBwcml2YXRlIHRlYW06IEJsb29kQmluZC5Qcm9wZXJ0eTxzdHJpbmc+O1xyXG4gICAgcHJpdmF0ZSBleHBvcnQ6IEJsb29kQmluZC5Qcm9wZXJ0eTxib29sZWFuPjtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBuZXcgQmxvb2RCaW5kLlByb3BlcnR5KCduZXdjaGFyYWN0ZXInKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuZXcgQmxvb2RCaW5kLlByb3BlcnR5KCdOZXcgQ2hhcmFjdGVyJyk7XHJcbiAgICAgICAgdGhpcy51blN0eWxlZEltYWdlID0gbmV3IEJsb29kQmluZC5Qcm9wZXJ0eTxzdHJpbmd8bnVsbD4obnVsbCk7XHJcbiAgICAgICAgdGhpcy5zdHlsZWRJbWFnZSA9IG5ldyBCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nfG51bGw+KG51bGwpO1xyXG4gICAgICAgIHRoaXMudGVhbSA9IG5ldyBCbG9vZEJpbmQuRW51bVByb3BlcnR5KEJsb29kVGVhbS5UT1dOU0ZPTEssIEJsb29kVGVhbS5vcHRpb25zKCkpO1xyXG4gICAgICAgIHRoaXMuZXhwb3J0ID0gbmV3IEJsb29kQmluZC5Qcm9wZXJ0eTxib29sZWFuPih0cnVlKTtcclxuICAgIH1cclxuICAgIGdldElkUHJvcGVydHkoKTpCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nPntyZXR1cm4gdGhpcy5pZDt9XHJcbiAgICBnZXROYW1lUHJvcGVydHkoKTpCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nPntyZXR1cm4gdGhpcy5uYW1lO31cclxuICAgIGdldE5hbWUoKTpzdHJpbmd7cmV0dXJuIHRoaXMubmFtZS5nZXQoKTt9XHJcbiAgICBnZXRVblN0eWxlZEltYWdlUHJvcGVydHkoKTpCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nfG51bGw+e3JldHVybiB0aGlzLnVuU3R5bGVkSW1hZ2U7fVxyXG4gICAgZ2V0U3R5bGVkSW1hZ2VQcm9wZXJ0eSgpOkJsb29kQmluZC5Qcm9wZXJ0eTxzdHJpbmd8bnVsbD57cmV0dXJuIHRoaXMuc3R5bGVkSW1hZ2U7fVxyXG4gICAgZ2V0VGVhbVByb3BlcnR5UHJvcGVydHkoKTpCbG9vZEJpbmQuUHJvcGVydHk8c3RyaW5nPntyZXR1cm4gdGhpcy50ZWFtO31cclxuICAgIGdldEV4cG9ydFByb3BlcnR5KCk6Qmxvb2RCaW5kLlByb3BlcnR5PGJvb2xlYW4+e3JldHVybiB0aGlzLmV4cG9ydDt9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJsb29kRG9jdW1lbnQge1xyXG4gICAgcHJpdmF0ZSBibG9vZElkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHByZXZpZXdPblRva2VuOiBCbG9vZEJpbmQuUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgICBwcml2YXRlIGRpcnR5OiBCbG9vZEJpbmQuUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgICBwcml2YXRlIG1ldGE6IEJsb29kRG9jdW1lbnRNZXRhO1xyXG4gICAgcHJpdmF0ZSB3aW5kb3dUaXRsZTogQmxvb2RCaW5kLlByb3BlcnR5PHN0cmluZz47XHJcbiAgICBwcml2YXRlIGNoYXJhY3Rlckxpc3Q6IEJsb29kQ2hhcmFjdGVyW107XHJcbiAgICBwcml2YXRlIGZpcnN0TmlnaHRPcmRlcjogYmlnaW50W107XHJcbiAgICBwcml2YXRlIG90aGVyTmlnaHRPcmRlcjogYmlnaW50W107XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmJsb29kSWQgPSBnZW5CbG9vZElkKCk7XHJcbiAgICAgICAgdGhpcy5wcmV2aWV3T25Ub2tlbiA9IG5ldyBCbG9vZEJpbmQuUHJvcGVydHk8Ym9vbGVhbj4odHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IG5ldyBCbG9vZEJpbmQuUHJvcGVydHk8Ym9vbGVhbj4oZmFsc2UpO1xyXG4gICAgICAgIHRoaXMubWV0YSA9IG5ldyBCbG9vZERvY3VtZW50TWV0YSgpO1xyXG4gICAgICAgIHRoaXMud2luZG93VGl0bGUgPSBuZXcgQmxvb2RCaW5kLlByb3BlcnR5KCdCbG9vZHN0YXIgQ2xvY2t0aWNhJyk7XHJcbiAgICAgICAgLy8gVE9ETzogbGlzdCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJMaXN0ID0gW25ldyBCbG9vZENoYXJhY3RlcigpXTtcclxuICAgICAgICB0aGlzLmZpcnN0TmlnaHRPcmRlciA9IFtdO1xyXG4gICAgICAgIHRoaXMub3RoZXJOaWdodE9yZGVyID0gW107XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGhvb2sgdXAgYXV0by1kaXJ0eVxyXG4gICAgICAgIC8vIFRPRE86IGhvb2sgdXAgYXV0b21hdGljIHRpdGxlIGNoYW5nZSBvbiBkaXJ0eVxyXG4gICAgfVxyXG4gICAgLy8vIERFU1RSVUNUSVZFXHJcbiAgICByZXNldChuYW1lOnN0cmluZykge1xyXG4gICAgICAgIHRoaXMuYmxvb2RJZCA9IGdlbkJsb29kSWQoKTtcclxuICAgICAgICB0aGlzLnByZXZpZXdPblRva2VuLnNldCh0cnVlKTtcclxuICAgICAgICB0aGlzLm1ldGEucmVzZXQobmFtZSk7XHJcbiAgICAgICAgdGhpcy53aW5kb3dUaXRsZS5zZXQoJ0Jsb29kc3RhciBDbG9ja3RpY2EnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJMaXN0Lmxlbmd0aCA9IDA7XHJcbiAgICAgICAgdGhpcy5hZGROZXdDaGFyYWN0ZXIoKTtcclxuICAgICAgICB0aGlzLmZpcnN0TmlnaHRPcmRlciA9IFtdO1xyXG4gICAgICAgIHRoaXMub3RoZXJOaWdodE9yZGVyID0gW107XHJcbiAgICAgICAgdGhpcy5kaXJ0eS5zZXQoZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgZ2V0Q2hhcmFjdGVyTGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXJMaXN0O1xyXG4gICAgfVxyXG4gICAgYWRkTmV3Q2hhcmFjdGVyKCkge1xyXG4gICAgICAgIHRoaXMuY2hhcmFjdGVyTGlzdC5wdXNoKG5ldyBCbG9vZENoYXJhY3RlcigpKTtcclxuICAgICAgICB0aGlzLmRpcnR5LnNldCh0cnVlKTtcclxuICAgIH1cclxuICAgIGFzeW5jIHNhdmVBcyhfbmFtZTpzdHJpbmcpOlByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vdCB5ZXQgaW1wbGVtZW50ZWRcIik7XHJcbiAgICB9XHJcbiAgICBhc3luYyBzYXZlKCk6UHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IExvYWREbGcuc2hvdyh0aGlzLl9zYXZlKCkpO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgX3NhdmUoKTpQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICBjb25zdCBzYXZlRGF0YTpTYXZlRGF0YSA9IHtcclxuICAgICAgICAgICAgYmxvb2RJZDogdGhpcy5ibG9vZElkLFxyXG4gICAgICAgICAgICBjaGVjazogaGFzaEZ1bmModGhpcy5ibG9vZElkKSxcclxuICAgICAgICAgICAgJ21ldGEuanNvbic6IEpTT04uc3RyaW5naWZ5KHRoaXMubWV0YS5nZXRTYXZlRGF0YSgpKSxcclxuICAgICAgICAgICAgc3JjX2ltYWdlczp7fSxcclxuICAgICAgICAgICAgcm9sZXM6e30sXHJcbiAgICAgICAgICAgIHByb2Nlc3NlZF9pbWFnZXM6e31cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vd3d3Lm1leWVybWlrZS5jb20vYmxvb2RzdGFyL3NhdmUucGhwJywge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOnsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nfSxcclxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHNhdmVEYXRhKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCByZXNwb25zZVRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2VKc29uID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpO1xyXG4gICAgICAgIGNvbnN0IHtlcnJvcn0gPSByZXNwb25zZUpzb247XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlydHkuc2V0KGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGFzeW5jIG9wZW4obmFtZTpzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBvcGVuRGF0YSA9IHtcclxuICAgICAgICAgICAgYmxvb2RJZDogdGhpcy5ibG9vZElkLFxyXG4gICAgICAgICAgICBjaGVjazogaGFzaEZ1bmModGhpcy5ibG9vZElkKSxcclxuICAgICAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly93d3cubWV5ZXJtaWtlLmNvbS9ibG9vZHN0YXIvb3Blbi5waHAnLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6eydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbid9LFxyXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkob3BlbkRhdGEpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IHlldCBpbXBsZW1lbnRlZCcpO1xyXG4gICAgfVxyXG4gICAgZ2V0RGlydHkoKTpib29sZWFuIHsgcmV0dXJuIHRoaXMuZGlydHkuZ2V0KCk7IH1cclxuICAgIGdldE5hbWUoKTpzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXRhLmdldE5hbWUoKTsgfVxyXG4gICAgZ2V0Rmlyc3ROaWdodE9yZGVyKCk6YmlnaW50W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpcnN0TmlnaHRPcmRlcjtcclxuICAgIH1cclxuICAgIGdldE90aGVyTmlnaHRPcmRlcigpOmJpZ2ludFtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vdGhlck5pZ2h0T3JkZXI7XHJcbiAgICB9XHJcbn0iLCJcclxudHlwZSBSZW5kZXJGbiA9IChpdGVtRGF0YTphbnkpPT5FbGVtZW50O1xyXG50eXBlIENsZWFudXBGbiA9IChsaXN0RWxlbWVudDpIVE1MRWxlbWVudCk9PnZvaWQ7XHJcbnR5cGUgSXRlbURyYWdEYXRhID0ge1xyXG4gICAgZWxlbWVudDpIVE1MRWxlbWVudCxcclxuICAgIGl0ZW1EYXRhOmFueSxcclxuICAgIGxpc3Q6SFRNTEVsZW1lbnQsXHJcbiAgICBsaXN0RGF0YTphbnlbXSxcclxuICAgIHJlbmRlckl0ZW1GbjpSZW5kZXJGbixcclxuICAgIGNsZWFudXBJdGVtRm46Q2xlYW51cEZuXHJcbn07XHJcbmxldCBnRHJhZ2dlZDpJdGVtRHJhZ0RhdGF8bnVsbCA9IG51bGw7XHJcbmxldCBnRHJhZ2dlZE92ZXI6SXRlbURyYWdEYXRhfG51bGwgPSBudWxsO1xyXG5cclxuY29uc3QgY2xlYW51cHMgPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBDbGVhbnVwRm4+KCk7XHJcblxyXG4vLy8gY2xlYW4gdXAgYWZ0ZXIgYSByZW5kZXJJdGVtc1xyXG5mdW5jdGlvbiBjbGVhckl0ZW1zKGxpc3RFbGVtZW50OkhUTUxFbGVtZW50KTp2b2lkIHtcclxuICAgIGNvbnN0IGNsZWFudXBGbiA9IGNsZWFudXBzLmdldChsaXN0RWxlbWVudCk7XHJcbiAgICBpZiAoY2xlYW51cEZuKSB7XHJcbiAgICAgICAgY2xlYW51cEZuKGxpc3RFbGVtZW50KTtcclxuICAgICAgICBjbGVhbnVwcy5kZWxldGUobGlzdEVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgbGlzdEVsZW1lbnQuaW5uZXJUZXh0ID0gJyc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckl0ZW1zKGxpc3Q6SFRNTEVsZW1lbnQsIGRhdGE6YW55W10sIHJlbmRlckl0ZW1GbjpSZW5kZXJGbiwgY2xlYW51cEl0ZW1GbjpDbGVhbnVwRm4pOnZvaWQge1xyXG4gICAgY2xlYXJJdGVtcyhsaXN0KTtcclxuICAgIGRhdGEuZm9yRWFjaCgoaXRlbURhdGEsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICBsaS5kcmFnZ2FibGUgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IGl0ZW1EcmFnRGF0YTpJdGVtRHJhZ0RhdGEgPSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6bGksXHJcbiAgICAgICAgICAgIGl0ZW1EYXRhLFxyXG4gICAgICAgICAgICBsaXN0LFxyXG4gICAgICAgICAgICBsaXN0RGF0YTpkYXRhLFxyXG4gICAgICAgICAgICByZW5kZXJJdGVtRm4sXHJcbiAgICAgICAgICAgIGNsZWFudXBJdGVtRm5cclxuICAgICAgICB9O1xyXG4gICAgICAgIGxpLmRhdGFzZXQuaW5kZXggPSBTdHJpbmcoaW5kZXgpO1xyXG4gICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWcnLCBfPT5kcmFnQmVnaW4oaXRlbURyYWdEYXRhKSk7XHJcbiAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCBlPT5kcmFnT3ZlcihlLCBpdGVtRHJhZ0RhdGEpKTtcclxuICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgXz0+ZHJhZ0VuZCgpKTtcclxuICAgICAgICBsaS5hcHBlbmRDaGlsZChyZW5kZXJJdGVtRm4oaXRlbURhdGEpKTtcclxuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuXHJcbiAgICAgICAgLy8gcmVtZW1iZXIgaG93IHRvIGNsZWFuIHVwXHJcbiAgICAgICAgY2xlYW51cHMuc2V0KGxpLCBjbGVhbnVwSXRlbUZuKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBkcmFnQmVnaW4gPSAoaXRlbURyYWdEYXRhOkl0ZW1EcmFnRGF0YSkgPT4ge1xyXG4gICAgZ0RyYWdnZWQgPSBpdGVtRHJhZ0RhdGE7XHJcbn07XHJcblxyXG5jb25zdCBkcmFnT3ZlciA9IChlOkRyYWdFdmVudCwgaXRlbURyYWdEYXRhOkl0ZW1EcmFnRGF0YSkgPT4ge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZ0RyYWdnZWRPdmVyID0gaXRlbURyYWdEYXRhO1xyXG59O1xyXG5cclxuY29uc3QgZHJhZ0VuZCA9ICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCFnRHJhZ2dlZCB8fCAhZ0RyYWdnZWRPdmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICBlbGVtZW50OmRyYWdnZWRFbGVtZW50LFxyXG4gICAgICAgICAgICBpdGVtRGF0YTpkcmFnZ2VkSXRlbURhdGEsXHJcbiAgICAgICAgICAgIGxpc3Q6ZHJhZ2dlZEl0ZW1MaXN0LFxyXG4gICAgICAgICAgICBsaXN0RGF0YTpkcmFnZ2VkTGlzdERhdGEsXHJcbiAgICAgICAgICAgIHJlbmRlckl0ZW1GbixcclxuICAgICAgICAgICAgY2xlYW51cEl0ZW1GblxyXG4gICAgICAgIH0gPSBnRHJhZ2dlZDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIWRyYWdnZWRFbGVtZW50LmRhdGFzZXQuaW5kZXggKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZnJvbUluZGV4ID0gcGFyc2VJbnQoZHJhZ2dlZEVsZW1lbnQuZGF0YXNldC5pbmRleCwgMTApO1xyXG5cclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ZHJhZ2dlZE92ZXJFbGVtZW50LFxyXG4gICAgICAgICAgICBsaXN0OmRyYWdnZWRPdmVySXRlbUxpc3QsXHJcbiAgICAgICAgfSA9IGdEcmFnZ2VkT3ZlcjtcclxuICAgICAgICBpZiAoIWRyYWdnZWRPdmVyRWxlbWVudC5kYXRhc2V0LmluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdG9JbmRleCA9IHBhcnNlSW50KGRyYWdnZWRPdmVyRWxlbWVudC5kYXRhc2V0LmluZGV4LCAxMCk7XHJcbiAgICBcclxuICAgICAgICBpZiAoZHJhZ2dlZEl0ZW1MaXN0ICE9PSBkcmFnZ2VkT3Zlckl0ZW1MaXN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZyb21JbmRleCA9PT0gdG9JbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYWdnZWRMaXN0RGF0YS5zcGxpY2UoZnJvbUluZGV4LCAxKTtcclxuICAgICAgICBkcmFnZ2VkTGlzdERhdGEuc3BsaWNlKHRvSW5kZXgsIDAsIGRyYWdnZWRJdGVtRGF0YSk7XHJcbiAgICBcclxuICAgICAgICBnRHJhZ2dlZCA9IG51bGw7XHJcbiAgICAgICAgZ0RyYWdnZWRPdmVyID0gbnVsbDtcclxuICAgICAgICByZW5kZXJJdGVtcyhkcmFnZ2VkSXRlbUxpc3QsIGRyYWdnZWRMaXN0RGF0YSwgcmVuZGVySXRlbUZuLCBjbGVhbnVwSXRlbUZuKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgZ0RyYWdnZWQgPSBudWxsO1xyXG4gICAgICAgIGdEcmFnZ2VkT3ZlciA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBCbG9vZERyYWcgPSB7XHJcbiAgICByZW5kZXJJdGVtc1xyXG59XHJcbiIsIlxyXG4vLy8gY2xlYXIgb3V0IGFsbCBjaGlsZHJlblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGROb2RlcyhwYXJlbnQ6Tm9kZSkge1xyXG4gICAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgaWYgKHBhcmVudC5sYXN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5sYXN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCAqIGFzIEJsb29kRG9jdW1lbnQgZnJvbSAnLi9ibG9vZC1kb2N1bWVudCc7XHJcbmltcG9ydCB7IEJsb29kRHJhZyB9IGZyb20gJy4vYmxvb2QtZHJhZyc7XHJcbmltcG9ydCBCbG9vZEJpbmQgZnJvbSAnLi9ibG9vZC1iaW5kJztcclxuaW1wb3J0ICogYXMgQmxvb2ROZXdPcGVuIGZyb20gJy4vZGxnL2Jsb29kLW5ldy1vcGVuLWRsZyc7XHJcbmltcG9ydCAqIGFzIEJsb29kT3BlbkRsZyBmcm9tICcuL2RsZy9ibG9vZC1vcGVuLWRsZyc7XHJcbmltcG9ydCAqIGFzIEJsb29kU2RjIGZyb20gJy4vZGxnL2Jsb29kLXNhdmUtZGlzY2FyZC1jYW5jZWwnO1xyXG5cclxubGV0IGJsb29kRG9jdW1lbnQgPSBuZXcgQmxvb2REb2N1bWVudC5CbG9vZERvY3VtZW50KCk7XHJcbmxldCBjaGFyYWN0ZXJMaXN0RWxlbWVudCA9IG51bGw7XHJcblxyXG5jb25zdCBtYWtlQ2hhcmFjdGVyTGlzdEl0ZW0gPSAoYmxvb2RDaGFyYWN0ZXI6Qmxvb2REb2N1bWVudC5CbG9vZENoYXJhY3RlcikgPT4ge1xyXG4gIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHJvdy5jbGFzc05hbWUgPSAnY2hhcmFjdGVyLWxpc3QtaXRlbSc7XHJcblxyXG4gIHtcclxuICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgIGNoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgY2hlY2tib3guY2xhc3NOYW1lID0gJ2NoZWNrYm94JztcclxuICAgIEJsb29kQmluZC5iaW5kQ2hlY2tib3goY2hlY2tib3gsIGJsb29kQ2hhcmFjdGVyLmdldEV4cG9ydFByb3BlcnR5KCkpO1xyXG4gICAgcm93LmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICB9XHJcbiAgXHJcbiAge1xyXG4gICAgICBjb25zdCBuYW1lRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgbmFtZUVsZW1lbnQuY2xhc3NOYW1lID0gJ2NoYXJhY3Rlci1saXN0LW5hbWUnO1xyXG4gICAgICBuYW1lRWxlbWVudC5vbmNsaWNrID0gKCk9PmNvbnNvbGUubG9nKGJsb29kQ2hhcmFjdGVyLmdldE5hbWUoKSk7XHJcbiAgICAgIEJsb29kQmluZC5iaW5kTGFiZWwobmFtZUVsZW1lbnQsIGJsb29kQ2hhcmFjdGVyLmdldE5hbWVQcm9wZXJ0eSgpKTtcclxuICAgICAgcm93LmFwcGVuZENoaWxkKG5hbWVFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHtcclxuICAgICAgY29uc3QgdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgIHVwLmNsYXNzTmFtZSA9ICdjaGFyYWN0ZXItbGlzdC1idXR0b24nO1xyXG4gICAgICB1cC5pbm5lclRleHQgPSAn4payJztcclxuICAgICAgdXAub25jbGljayA9ICgpPT5jb25zb2xlLmxvZygndXAgYnV0dG9uIGNsaWNrZWQnKTtcclxuICAgICAgcm93LmFwcGVuZENoaWxkKHVwKTtcclxuICB9XHJcblxyXG4gIHtcclxuICAgICAgY29uc3QgZG93biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgZG93bi5jbGFzc05hbWUgPSAnY2hhcmFjdGVyLWxpc3QtYnV0dG9uJztcclxuICAgICAgZG93bi5pbm5lclRleHQgPSAn4pa8JztcclxuICAgICAgZG93bi5vbmNsaWNrID0gKCk9PmNvbnNvbGUubG9nKCdkb3duIGJ1dHRvbiBjbGlja2VkJyk7XHJcbiAgICAgIHJvdy5hcHBlbmRDaGlsZChkb3duKTtcclxuICB9XHJcblxyXG4gIHtcclxuICAgICAgY29uc3QgZGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICBkZWwuY2xhc3NOYW1lID0gJ2NoYXJhY3Rlci1saXN0LWJ1dHRvbic7XHJcbiAgICAgIGRlbC5pbm5lclRleHQgPSAnRGVsZXRlJztcclxuICAgICAgZGVsLm9uY2xpY2sgPSAoKT0+Y29uc29sZS5sb2coJ2RlbGV0ZSBidXR0b24gY2xpY2tlZCcpO1xyXG4gICAgICByb3cuYXBwZW5kQ2hpbGQoZGVsKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByb3c7XHJcbn07XHJcbmZ1bmN0aW9uIGNsZWFudXBMaXN0SXRlbShub2RlOk5vZGUpOnZvaWQge1xyXG4gIG5vZGUuY2hpbGROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgQmxvb2RCaW5kLnVuYmluZEVsZW1lbnQobm9kZSk7XHJcbiAgICBub2RlLmNoaWxkTm9kZXMuZm9yRWFjaChjbGVhbnVwTGlzdEl0ZW0pO1xyXG4gIH0pO1xyXG59O1xyXG5mdW5jdGlvbiBhZGRDaGFyYWN0ZXJDbGlja2VkKF86RXZlbnQpOnZvaWQge1xyXG4gIGJsb29kRG9jdW1lbnQuYWRkTmV3Q2hhcmFjdGVyKCk7XHJcbiAgY29uc3QgY2hhcmFjdGVyTGlzdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcmFjdGVybGlzdCcpO1xyXG4gIGlmIChjaGFyYWN0ZXJMaXN0RWxlbWVudCkge1xyXG4gICAgQmxvb2REcmFnLnJlbmRlckl0ZW1zKGNoYXJhY3Rlckxpc3RFbGVtZW50LCBibG9vZERvY3VtZW50LmdldENoYXJhY3Rlckxpc3QoKSwgbWFrZUNoYXJhY3Rlckxpc3RJdGVtLCBjbGVhbnVwTGlzdEl0ZW0pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBzaG93SGVscCgpIHtcclxuXHJcbn1cclxuZnVuY3Rpb24gaG9va3VwQ2xpY2tFdmVudHMoZGF0YTpbc3RyaW5nLChlOkV2ZW50KT0+dm9pZF1bXSkge1xyXG4gIGZvciAoY29uc3QgW2lkLCBjYl0gb2YgZGF0YSkge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgIGlmIChlbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYik7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8gZmlsZSA+IG5ldyBjbGlja2VkXHJcbmFzeW5jIGZ1bmN0aW9uIG5ld0ZpbGUoKXtcclxuICBpZiAoYXdhaXQgQmxvb2RTZGMuc2F2ZVByb21wdElmRGlydHkoKSkge1xyXG4gICAgYmxvb2REb2N1bWVudC5yZXNldCgnTmV3IEVkaXRpb24nKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyBmaWxlID4gb3BlbiBjbGlja2VkXHJcbmFzeW5jIGZ1bmN0aW9uIG9wZW5GaWxlKCl7XHJcbiAgaWYgKGF3YWl0IEJsb29kU2RjLnNhdmVQcm9tcHRJZkRpcnR5KCkpIHtcclxuICAgIGNvbnN0IG5hbWUgPSBhd2FpdCBCbG9vZE9wZW5EbGcuc2hvdygpO1xyXG4gICAgaWYgKG5hbWUpIHtcclxuICAgICAgYXdhaXQgYmxvb2REb2N1bWVudC5vcGVuKG5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4vLy8gZmlsZSA+IHNhdmUgY2xpY2tlZFxyXG5hc3luYyBmdW5jdGlvbiBzYXZlRmlsZSgpe1xyXG4gIGF3YWl0IGJsb29kRG9jdW1lbnQuc2F2ZSgpO1xyXG59XHJcbi8vLyBmaWxlID4gc2F2ZSBhcyBjbGlja2VkXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVGaWxlQXMoKXtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ25vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcclxuICBkb2N1bWVudC5vbmtleWRvd24gPSBlID0+IHtcclxuICAgICAgaWYgKGUuY3RybEtleSkge1xyXG4gICAgICAgICAgaWYgKGUuY29kZSA9PT0gJ0tleVMnKSB7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIHNhdmVGaWxlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9XHJcbiAgaG9va3VwQ2xpY2tFdmVudHMoW1xyXG4gICAgWydhZGRjaGFyYWN0ZXJidXR0b24nLCBhZGRDaGFyYWN0ZXJDbGlja2VkXSxcclxuICAgIFsnbmV3ZmlsZWJ1dHRvbicsIG5ld0ZpbGVdLFxyXG4gICAgWydvcGVuZmlsZWJ1dHRvbicsIG9wZW5GaWxlXSxcclxuICAgIFsnc2F2ZWZpbGVidXR0b24nLCBzYXZlRmlsZV0sXHJcbiAgICBbJ3NhdmVmaWxlYXNidXR0b24nLCBzYXZlRmlsZUFzXSxcclxuICAgIFsnaGVscGJ1dHRvbicsIHNob3dIZWxwXSxcclxuICBdKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEJsb29kTmV3T3Blbi5zaG93KCk7XHJcbiAgICBjb25zdCB7b3Blbk5hbWUsbmV3TmFtZX0gPSByZXN1bHQ7XHJcbiAgICBpZiAob3Blbk5hbWUpIHtcclxuICAgICAgYXdhaXQgYmxvb2REb2N1bWVudC5vcGVuKG9wZW5OYW1lKTtcclxuICAgIH0gZWxzZSBpZiAobmV3TmFtZSkge1xyXG4gICAgICBibG9vZERvY3VtZW50LnJlc2V0KG5ld05hbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgcmVzdWx0IGZyb20gbmV3LW9wZW4tZGxnJyk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgIGJsb29kRG9jdW1lbnQucmVzZXQoJ3NhbmRib3gnKTtcclxuICB9XHJcbiAgY2hhcmFjdGVyTGlzdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcmFjdGVybGlzdCcpO1xyXG4gIGlmIChjaGFyYWN0ZXJMaXN0RWxlbWVudCkge1xyXG4gICAgQmxvb2REcmFnLnJlbmRlckl0ZW1zKGNoYXJhY3Rlckxpc3RFbGVtZW50LCBibG9vZERvY3VtZW50LmdldENoYXJhY3Rlckxpc3QoKSwgbWFrZUNoYXJhY3Rlckxpc3RJdGVtLCBjbGVhbnVwTGlzdEl0ZW0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHdhaXQgZm9yIGRvbSB0byBsb2FkXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpO1xyXG59IGVsc2Uge1xyXG4gIC8vIGBET01Db250ZW50TG9hZGVkYCBhbHJlYWR5IGZpcmVkXHJcbiAgaW5pdCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RG9jdW1lbnQoKSB7XHJcbiAgcmV0dXJuIGJsb29kRG9jdW1lbnQ7XHJcbn0iLCJ0eXBlIFJlc29sdmVGbiA9ICh2YWx1ZTphbnkpPT52b2lkO1xyXG50eXBlIFJlamVjdEZuID0gKGVycm9yOmFueSk9PnZvaWQ7XHJcbnR5cGUgQnV0dG9uQ2IgPSAoKT0+UHJvbWlzZTxhbnk+O1xyXG5leHBvcnQgdHlwZSBCdXR0b25DZmcgPSB7bGFiZWw6c3RyaW5nLGNhbGxiYWNrOkJ1dHRvbkNifTtcclxudHlwZSBEaWFsb2dEYXRhID0ge1xyXG4gICAgcmVzb2x2ZTpSZXNvbHZlRm4sXHJcbiAgICByZWplY3Q6IFJlamVjdEZuXHJcbn07XHJcbmNvbnN0IGRpYWxvZ0RhdGEgPSBuZXcgTWFwPEVsZW1lbnQsIERpYWxvZ0RhdGE+KCk7XHJcblxyXG4vLy8gc2hvdyB0aGUgZGlhbG9nLCBzdG9yZSBwcm9taXNlIGNhbGxiYWNrc1xyXG5mdW5jdGlvbiBvcGVuRGlhbG9nKGRpYWxvZzpIVE1MRWxlbWVudCwgcmVzb2x2ZTpSZXNvbHZlRm4sIHJlamVjdDpSZWplY3RGbikge1xyXG4gICAgY29uc3QgZGF0YSA9IGRpYWxvZ0RhdGEuZ2V0KGRpYWxvZyk7XHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIGRhdGEucmVqZWN0KCdkaWFsb2cgY2xvc2VkIHByZW1hdHVyZWx5Jyk7XHJcbiAgICB9XHJcbiAgICBkaWFsb2cuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIGRpYWxvZ0RhdGEuc2V0KGRpYWxvZywge3Jlc29sdmUsIHJlamVjdH0pO1xyXG59XHJcblxyXG4vLy8gcmVzb2x2ZSBwcm9taXNlIGFuZCBoaWRlIHRoZSBkaWFsb2dcclxuYXN5bmMgZnVuY3Rpb24gY2xvc2VEaWFsb2dfY2IoZGlhbG9nOkhUTUxFbGVtZW50LCBjYWxsYmFjazpCdXR0b25DYikge1xyXG4gICAgbGV0IHZhbHVlOmFueSA9IG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhbHVlID0gYXdhaXQgY2FsbGJhY2soKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgY2xvc2VEaWFsb2coZGlhbG9nLCB2YWx1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vLyByZXNvbHZlIHByb21pc2UgYW5kIGhpZGUgdGhlIGRpYWxvZ1xyXG5mdW5jdGlvbiBjbG9zZURpYWxvZyhkaWFsb2c6SFRNTEVsZW1lbnQsIHJlc3VsdDphbnkpIHtcclxuICAgIGNvbnN0IGRhdGEgPSBkaWFsb2dEYXRhLmdldChkaWFsb2cpO1xyXG4gICAgaWYgKCFkYXRhKSB7IHJldHVybjsgfVxyXG4gICAgZGlhbG9nRGF0YS5kZWxldGUoZGlhbG9nKTtcclxuICAgIGRpYWxvZy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgZGF0YS5yZXNvbHZlKHJlc3VsdCk7XHJcbn1cclxuXHJcbi8vLyByZXNvbHZlIHRoZSBjdXJyZW50IGRpYWxvZ1xyXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZURpYWxvZyhlbGVtZW50OkhUTUxFbGVtZW50LCB2YWx1ZU9yUHJvbWlzZTphbnkpIHtcclxuICAgIGNvbnN0IGRpYWxvZyA9IGVsZW1lbnQuY2xvc2VzdCgnLmRpYWxvZy1zY3JpbScpO1xyXG4gICAgaWYgKCFkaWFsb2cpIHsgcmV0dXJuOyB9XHJcbiAgICBjb25zdCBkYXRhID0gZGlhbG9nRGF0YS5nZXQoZGlhbG9nKTtcclxuICAgIGlmICghZGF0YSkgeyByZXR1cm47IH1cclxuICAgIGRpYWxvZ0RhdGEuZGVsZXRlKGRpYWxvZyk7XHJcbiAgICBpZiAoZGlhbG9nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBkaWFsb2cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICAgIGRhdGEucmVzb2x2ZSh2YWx1ZU9yUHJvbWlzZSk7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIE9wZW5GbiA9ICgpPT5Qcm9taXNlPGFueT47XHJcbmV4cG9ydCB0eXBlIENsb3NlRm4gPSAocmVzdWx0OmFueSk9PnZvaWQ7XHJcblxyXG4vLy8gcHJlcGFyZSBhIGRpYWxvZ1xyXG4vLy8gXHJcbi8vLyBpZCAtIGNzcyBpZCBmb3IgdGhlIGRpYWxvZ1xyXG4vLy8gYm9keSAtIEFycmF5IG9mIGVsZW1lbnRzIHRvIGJlIGFkZGVkIGluc2lkZSB0aGUgZGlhbG9nXHJcbi8vLyBidXR0b25zIC0gQXJyYXkgb2YgT2JqZWN0cyB0aGF0IGxvb2sgbGlrZSB7bGFiZWw6J3NvbWVMYWJlbCcsIGNhbGxiYWNrOnNvbWVDYWxsYmFja30uIHVzZWQgdG8gY3JlYXRlIGJ1dHRvbnNcclxuLy8vICAgICAgICAgICBUaGUgY2FsbGJhY2sgc2hvdWxkIHJldHVybiBhIHByb21pc2UsIHdob3NlIHJlc3VsdCB3aWxsIGJlIHVzZWQgYXMgdGhlIHJlc3VsdCBvZiB0aGUgZGlhbG9nXHJcbi8vLyByZXR1cm4gLSBhbiBhcnJheSBjb250YWluaW5nOlxyXG4vLy8gICAgICAgICAgICAwOiBhIGZ1bmN0aW9uIHRoYXQgeW91IGNhbiBjYWxsIHRvIG9wZW4gdGhlIHBvcHVwIGBmdW5jdGlvbiBvcGVuRm4oKTpQcm9taXNley4uLn1gXHJcbi8vLyAgICAgICAgICAgIDE6IGEgZnVuY3Rpb24geW91IGNhbiBjYWxsIHRvIGNsb3NlIHRoZSBwb3B1cCBlYXJseSBgZnVuY3Rpb24gY2xvc2VGbihyZXN1bHQpOnZvaWR7Li4ufWBcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoaWQ6c3RyaW5nLCBib2R5OkhUTUxFbGVtZW50W10sIGJ1dHRvbnM6QnV0dG9uQ2ZnW10pOltPcGVuRm4sIENsb3NlRm5dIHtcclxuICAgIC8vIFRPRE86IHRyYWNrIHdoZXRoZXIgdGhpcyBpZCB3YXMgdXNlZCBiZWZvcmUuIGVhcmx5IGV4aXQgaWYgaXQgaGFzIGJlZW5cclxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGlhbG9nLmNsYXNzTmFtZSA9ICdkaWFsb2ctc2NyaW0nO1xyXG4gICAgZGlhbG9nLmlkID0gaWQ7XHJcbiAgICBkaWFsb2cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICBjb25zdCBib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGJveC5jbGFzc05hbWUgPSAnZGlhbG9nLWJveCc7XHJcblxyXG4gICAgY29uc3QgYnRuR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGJ0bkdyb3VwLmNsYXNzTmFtZSA9ICdkaWFsb2ctYnRuLWdyb3VwJztcclxuXHJcbiAgICAvLyBjcmVhdGUgYnV0dG9uc1xyXG4gICAgZm9yIChjb25zdCB7bGFiZWwsIGNhbGxiYWNrfSBvZiBidXR0b25zKSB7XHJcbiAgICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4gYXdhaXQgY2xvc2VEaWFsb2dfY2IoZGlhbG9nLCBjYWxsYmFjaykgKTtcclxuICAgICAgICBidG4uaW5uZXJUZXh0ID0gbGFiZWw7XHJcbiAgICAgICAgYnRuR3JvdXAuYXBwZW5kQ2hpbGQoYnRuKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgYm9keSBlbGVtZW50cyB0byBib3hcclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBib2R5KSB7XHJcbiAgICAgICAgYm94LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZvbGxvd2VkIGJ5IGJ1dHRvbnNcclxuICAgIGJveC5hcHBlbmRDaGlsZChidG5Hcm91cCk7XHJcblxyXG4gICAgLy8gYm94IGluIGRsZywgZGxnIGluIGRvY3VtZW50LlxyXG4gICAgZGlhbG9nLmFwcGVuZENoaWxkKGJveCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpYWxvZyk7XHJcblxyXG4gICAgLy8gVE9ETzogc2hvdWxkIGJlIGFuIG9iamVjdFxyXG4gICAgY29uc3QgZnVuY3M6W09wZW5GbiwgQ2xvc2VGbl0gPSBbXHJcbiAgICAgICAgKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9Pm9wZW5EaWFsb2coZGlhbG9nLCByZXNvbHZlLCByZWplY3QpKSxcclxuICAgICAgICAocmVzdWx0OiBhbnkpID0+IGNsb3NlRGlhbG9nKGRpYWxvZywgcmVzdWx0KVxyXG4gICAgXTtcclxuICAgIHJldHVybiBmdW5jcztcclxufSIsIi8vIG5ld2ZpbGUvb3BlbmZpbGUgZGlhbG9nIGZvciBibG9vZHN0YXIgY2xvY2t0aWNhXHJcbmltcG9ydCAqIGFzIEJsb29kRGxnIGZyb20gJy4vYmxvb2QtZGxnJztcclxuXHJcbmxldCBpbml0dGVkID0gZmFsc2U7XHJcbmxldCBzaG93Rm46Qmxvb2REbGcuT3BlbkZufG51bGwgPSBudWxsO1xyXG5sZXQgY2xvc2VGbjpCbG9vZERsZy5DbG9zZUZufG51bGwgPSBudWxsO1xyXG5cclxuLy8vIHByZXBhcmUgdGhlIGRpYWxvZyBmb3IgdXNlXHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBpZiAoaW5pdHRlZCkgeyByZXR1cm47IH1cclxuICAgIGluaXR0ZWQgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gJ3NwaW5uZXInO1xyXG4gICAgXHJcbiAgICBbc2hvd0ZuLCBjbG9zZUZuXSA9IEJsb29kRGxnLmluaXQoJ25ldy1vcGVuLWRsZycsIFtzcGlubmVyXSwgW10pO1xyXG59XHJcblxyXG4vLy8gc2hvdyB0aGUgc3Bpbm5lciB1bnRpbCB0aGUgcHJvbWlzZSByZXNvbHZlc1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvdzxUPihzb21lUHJvbWlzZTpQcm9taXNlPFQ+KTpQcm9taXNlPFQ+IHtcclxuICAgIGlmICghaW5pdHRlZCkgeyBpbml0KCk7IH1cclxuXHJcbiAgICBpZiAoIXNob3dGbikge3Rocm93IG5ldyBFcnJvcihcIm5vIHNob3dGblwiKTt9XHJcbiAgICBpZiAoIWNsb3NlRm4pIHt0aHJvdyBuZXcgRXJyb3IoXCJubyBjbG9zZUZuXCIpO31cclxuXHJcbiAgICAvLyBpZ25vcmUgcmVzdWx0IHByb21pc2VcclxuICAgIHNob3dGbigpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgc29tZVByb21pc2U7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIGNsb3NlRm4obnVsbCk7XHJcbiAgICB9XHJcbn0iLCIvLyBuZXdmaWxlL29wZW5maWxlIGRpYWxvZyBmb3IgYmxvb2RzdGFyIGNsb2NrdGljYVxyXG5pbXBvcnQgKiBhcyBCbG9vZERsZyBmcm9tICcuL2Jsb29kLWRsZyc7XHJcbmltcG9ydCAqIGFzIEJsb29kT3BlbkRsZyBmcm9tICcuL2Jsb29kLW9wZW4tZGxnJztcclxuXHJcbmxldCBpbml0dGVkOmJvb2xlYW4gPSBmYWxzZTtcclxubGV0IHNob3dGbjpCbG9vZERsZy5PcGVuRm58bnVsbCA9IG51bGw7XHJcbmxldCBjbG9zZUZuOkJsb29kRGxnLkNsb3NlRm58bnVsbCA9IG51bGw7XHJcblxyXG4vLy8gdXNlciBjaG9zZSB0byBvcGVuIGFuIGV4aXN0aW5nIGZpbGVcclxuYXN5bmMgZnVuY3Rpb24gb3BlbkV4aXN0aW5nKCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQmxvb2RPcGVuRGxnLnNob3coKTtcclxuICAgIC8vIGlmIGNhbmNlbGxlZCwgZG8gYW5vdGhlciBuZXctb3BlbiBkaWFsb2dcclxuICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHNob3coKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7b3Blbk5hbWU6cmVzdWx0fTtcclxufVxyXG5cclxuLy8vIHVzZXIgY2hvc2UgdG8gY3JlYXRlIGEgbmV3IGZpbGVcclxuZnVuY3Rpb24gY3JlYXRlTmV3KCk6UHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe25ld05hbWU6J05ldyBFZGl0aW9uJ30pO1xyXG59XHJcblxyXG4vLy8gcHJlcGFyZSB0aGUgZGlhbG9nIGZvciB1c2VcclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIGlmIChpbml0dGVkKSB7IHJldHVybjsgfVxyXG4gICAgaW5pdHRlZCA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIG1lc3NhZ2UuaW5uZXJUZXh0ID0gJ1RvIGdldCBzdGFydGVkLCBvcGVuIGFuIGV4aXN0aW5nIGVkaXRpb24gb3IgY3JlYXRlIGEgbmV3IG9uZS4nO1xyXG4gICAgXHJcbiAgICBjb25zdCBidXR0b25zOkJsb29kRGxnLkJ1dHRvbkNmZ1tdID0gW1xyXG4gICAgICAgIHtsYWJlbDonT3BlbiBFeGlzdGluZycsIGNhbGxiYWNrOm9wZW5FeGlzdGluZ30sXHJcbiAgICAgICAge2xhYmVsOidDcmVhdGUgTmV3JywgY2FsbGJhY2s6Y3JlYXRlTmV3fVxyXG4gICAgXTtcclxuICAgIFtzaG93Rm4sIGNsb3NlRm5dID0gQmxvb2REbGcuaW5pdCgnbmV3LW9wZW4tZGxnJywgW21lc3NhZ2VdLCBidXR0b25zKTtcclxufVxyXG5cclxuLy8vIGJyaW5nIHVwIGRpYWxvZyBmb3IgcGlja2luZyB3aGV0aGVyIHRvIG9wZW4gYW4gZXhpc3RpbmcgZmlsZSBvciBzdGFydCBhIG5ldyBvbmVcclxuLy8vIHJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IGxpa2Ugb25lIG9mIHRoZXNlOlxyXG4vLy8gICB7J29wZW4nOiA8bmFtZT59XHJcbi8vLyAgIHsnbmV3JzogPG5hbWU+fVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvdygpIHtcclxuICAgIGlmICghaW5pdHRlZCkgeyBpbml0KCk7IH1cclxuICAgIGlmICghc2hvd0ZuKSB7IHJldHVybjsgfVxyXG4gICAgcmV0dXJuIGF3YWl0IHNob3dGbigpO1xyXG59XHJcblxyXG4vLy8gdGFrZSBkb3duIHRoZSBwb3B1cFxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2UocmVzdWx0OmFueSkge1xyXG4gICAgaWYgKCFjbG9zZUZuKSB7IHJldHVybjsgfVxyXG4gICAgY2xvc2VGbihyZXN1bHQpO1xyXG59IiwiLy8gb3BlbiBkaWFsb2cgZm9yIGJsb29kc3RhciBjbG9ja3RpY2FcclxuaW1wb3J0ICogYXMgQmxvb2REbGcgZnJvbSAnLi9ibG9vZC1kbGcnO1xyXG5pbXBvcnQgKiBhcyBVdGlsIGZyb20gJy4uL2Jsb29kLXV0aWwnO1xyXG5cclxubGV0IGluaXR0ZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgc2hvd0ZuOkJsb29kRGxnLk9wZW5GbnxudWxsID0gbnVsbDtcclxubGV0IGNsb3NlRm46Qmxvb2REbGcuQ2xvc2VGbnxudWxsID0gbnVsbDtcclxubGV0IGZpbGVMaXN0RGl2OkhUTUxFbGVtZW50fG51bGwgPSBudWxsO1xyXG5cclxuLy8vIHVzZXIgY2hvc2UgdG8gY2FuY2VsXHJcbmZ1bmN0aW9uIGNhbmNlbENsaWNrZWQoKTpQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcclxufVxyXG5cclxuLy8vIHByZXBhcmUgdGhlIGRpYWxvZyBmb3IgdXNlXHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBpZiAoaW5pdHRlZCkgeyByZXR1cm47IH1cclxuICAgIGluaXR0ZWQgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBtZXNzYWdlLmlubmVyVGV4dCA9ICdDaG9vc2UgYW4gZXhpc3RpbmcgZmlsZSB0byBvcGVuOic7XHJcbiAgICBmaWxlTGlzdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZmlsZUxpc3REaXYuY2xhc3NOYW1lID0gJ29wZW4tZGxnLWxpc3QnO1xyXG4gICAgXHJcbiAgICBjb25zdCBidXR0b25zOkJsb29kRGxnLkJ1dHRvbkNmZ1tdID0gW3tsYWJlbDonQ2FuY2VsJywgY2FsbGJhY2s6Y2FuY2VsQ2xpY2tlZH1dO1xyXG4gICAgW3Nob3dGbiwgY2xvc2VGbl0gPSBCbG9vZERsZy5pbml0KCdvcGVuLWRsZycsIFttZXNzYWdlLCBmaWxlTGlzdERpdl0sIGJ1dHRvbnMpO1xyXG59XHJcblxyXG4vLy8gdXBkYXRlIGxpc3Qgb2YgZmlsZXNcclxuZnVuY3Rpb24gcmVwb3B1bGF0ZUZpbGVMaXN0KGZpbGVMaXN0OnN0cmluZ1tdKSB7XHJcbiAgICBpZiAoIWZpbGVMaXN0RGl2KSB7cmV0dXJuO31cclxuICAgIFV0aWwucmVtb3ZlQWxsQ2hpbGROb2RlcyhmaWxlTGlzdERpdik7XHJcblxyXG4gICAgaWYgKGZpbGVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgc3Bhbi5pbm5lclRleHQgPSAnTm8gZmlsZXMgZm91bmQuJztcclxuICAgICAgICBmaWxlTGlzdERpdi5hcHBlbmRDaGlsZChzcGFuKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGZpbGVMaXN0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT5CbG9vZERsZy5yZXNvbHZlRGlhbG9nKGVsZW1lbnQsIG5hbWUpKTtcclxuICAgICAgICAgICAgZWxlbWVudC5pbm5lclRleHQgPSBuYW1lO1xyXG4gICAgICAgICAgICBmaWxlTGlzdERpdi5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vLyBicmluZyB1cCBkaWFsb2cgZm9yIHBpY2tpbmcgd2hldGhlciB0byBvcGVuIGFuIGV4aXN0aW5nIGZpbGUgb3Igc3RhcnQgYSBuZXcgb25lXHJcbi8vLyByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgbmFtZSwgb3IgbnVsbCBpZiB0aGUgZGlhbG9nIHdhcyBjYW5jZWxsZWRcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3coKSB7XHJcbiAgICBpZiAoIWluaXR0ZWQpIHsgaW5pdCgpOyB9XHJcbiAgICBpZiAoIXNob3dGbikgeyByZXR1cm47IH1cclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL3d3dy5tZXllcm1pa2UuY29tL2Jsb29kc3Rhci9saXN0LnBocCcsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6eydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbid9XHJcbiAgICAgICAgfSk7XHJcbiAgICBjb25zdCByZXNwb25zZVRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICBjb25zdCByZXNwb25zZUpzb24gPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XHJcbiAgICBjb25zdCB7ZXJyb3IsZmlsZXN9ID0gcmVzcG9uc2VKc29uO1xyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yKTtcclxuICAgIH1cclxuICAgIHJlcG9wdWxhdGVGaWxlTGlzdChmaWxlcyk7XHJcbiAgICByZXR1cm4gYXdhaXQgc2hvd0ZuKCk7XHJcbn1cclxuXHJcbi8vLyB0YWtlIGRvd24gdGhlIHBvcHVwXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZShyZXN1bHQ6YW55KSB7XHJcbiAgICBpZiAoIWNsb3NlRm4pIHsgcmV0dXJuOyB9XHJcbiAgICBjbG9zZUZuKHJlc3VsdCk7XHJcbn0iLCJpbXBvcnQgKiBhcyBCbG9vZHN0YXIgZnJvbSAnLi4vYmxvb2RzdGFyJztcclxuaW1wb3J0ICogYXMgQmxvb2REbGcgZnJvbSAnLi9ibG9vZC1kbGcnO1xyXG5cclxubGV0IGluaXR0ZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgc2hvd0ZuOkJsb29kRGxnLk9wZW5GbiA9ICgpPT5Qcm9taXNlLnJlc29sdmUobnVsbCk7XHJcbmxldCBjbG9zZUZuOkJsb29kRGxnLkNsb3NlRm4gPSBfPT57fTtcclxuXHJcbmZ1bmN0aW9uIGFkZFRvUmVjZW50RG9jdW1lbnRzKCkge1xyXG4gICAgXHJcbn1cclxuZnVuY3Rpb24gdXBkYXRlTmlnaHRPcmRlcigpIHtcclxuICAgIFxyXG59XHJcblxyXG4vLy8gc2F2ZSB0aGUgY3VycmVudCBkb2N1bWVudCB1bmRlciBhIG5ldyBuYW1lXHJcbmV4cG9ydCBmdW5jdGlvbiBkb1NhdmVBcyhzYXZlSWQ6c3RyaW5nKTpQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHVwZGF0ZU5pZ2h0T3JkZXIoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9ICBCbG9vZHN0YXJcclxuICAgICAgICAuZ2V0RG9jdW1lbnQoKVxyXG4gICAgICAgIC5zYXZlQXMoc2F2ZUlkKTtcclxuICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICBhZGRUb1JlY2VudERvY3VtZW50cygpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvU2F2ZSgpOlByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdXBkYXRlTmlnaHRPcmRlcigpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQmxvb2RzdGFyXHJcbiAgICAgICAgLmdldERvY3VtZW50KClcclxuICAgICAgICAuc2F2ZSgpO1xyXG4gICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIGFkZFRvUmVjZW50RG9jdW1lbnRzKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzZGNTYXZlQ2xpY2tlZCgpOlByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IGRvU2F2ZSgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzZGNEaXNjYXJkQ2xpY2tlZCgpOlByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNkY0NhbmNlbENsaWNrZWQoKTpQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8vIG9uZS10aW1lIGluaXRpYWxpemF0aW9uXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgaWYgKGluaXR0ZWQpIHsgcmV0dXJuOyB9XHJcbiAgICBpbml0dGVkID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgbWVzc2FnZS5pbm5lclRleHQgPSAnWW91IGhhdmUgdW5zYXZlZCBjaGFuZ2VzISBXb3VsZCB5b3UgbGlrZSB0byBzYXZlIG5vdyBvciBkaXNjYXJkIHRoZW0/JztcclxuXHJcbiAgICBjb25zdCBidXR0b25zID0gW1xyXG4gICAgICAgIHtsYWJlbDonU2F2ZScsIGNhbGxiYWNrOnNkY1NhdmVDbGlja2VkfSxcclxuICAgICAgICB7bGFiZWw6J0Rpc2NhcmQnLCBjYWxsYmFjazpzZGNEaXNjYXJkQ2xpY2tlZH0sXHJcbiAgICAgICAge2xhYmVsOidDYW5jZWwnLCBjYWxsYmFjazpzZGNDYW5jZWxDbGlja2VkfSxcclxuICAgIF07XHJcbiAgICBbc2hvd0ZuLCBjbG9zZUZuXSA9IEJsb29kRGxnLmluaXQoJ3NkYy1kbGcnLCBbbWVzc2FnZV0sIGJ1dHRvbnMpO1xyXG59XHJcblxyXG4vLy8gaWYgZG9jdW1lbnQgaXMgZGlydHksIHByb21wdCBmb3IgYSBzYXZlLiBDYWxsIHRoZSBjYWxsYmFjayBpZiB0aGUgdXNlciBzYXZlcyBvciBkaXNjYXJkcyBjaGFuZ2VzXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJvbXB0SWZEaXJ0eSgpIHtcclxuICAgIGlmICghaW5pdHRlZCkgeyBpbml0KCk7IH1cclxuICAgIGNvbnN0IGJsb29kRG9jdW1lbnQgPSBCbG9vZHN0YXIuZ2V0RG9jdW1lbnQoKTtcclxuICAgIGlmIChibG9vZERvY3VtZW50LmdldERpcnR5KCkpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgc2hvd0ZuKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8vLyB0YWtlIGRvd24gdGhlIHBvcHVwXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZShyZXN1bHQ6YW55KSB7XHJcbiAgICBpZiAoIWNsb3NlRm4pIHsgcmV0dXJuOyB9XHJcbiAgICBjbG9zZUZuKHJlc3VsdCk7XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYmxvb2RzdGFyLnRzXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==