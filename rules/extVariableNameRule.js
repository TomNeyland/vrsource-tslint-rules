"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Lint = require("tslint/lib/lint");
var CLASS_TAG = "class";
var INTERFACE_TAG = "interface";
var PARAMETER_TAG = "parameter";
var PROPERTY_TAG = "property";
var METHOD_TAG = "method";
var FUNCTION_TAG = "function";
var VARIABLE_TAG = "variable";
var LOCAL_TAG = "local";
var STATIC_TAG = "static";
var CONST_TAG = "const";
var PUBLIC_TAG = "public";
var PROTECTED_TAG = "protected";
var PRIVATE_TAG = "private";
var VALID_VAR_TAGS = [CLASS_TAG, INTERFACE_TAG, PARAMETER_TAG,
    PROPERTY_TAG, METHOD_TAG, FUNCTION_TAG, VARIABLE_TAG,
    LOCAL_TAG, STATIC_TAG, CONST_TAG,
    PUBLIC_TAG, PROTECTED_TAG, PRIVATE_TAG];
var PASCAL_OPTION = "pascal";
var CAMEL_OPTION = "camel";
var SNAKE_OPTION = "snake";
var UPPER_OPTION = "upper";
var LEADING_UNDERSCORE_OPTION = "allow-leading-underscore";
var TRAILING_UNDERSCORE_OPTION = "allow-trailing-underscore";
var BAN_KEYWORDS_OPTION = "ban-keywords";
var CAMEL_FAIL = "Variable must be in camel case";
var PASCAL_FAIL = "Variable must be in pascal case";
var SNAKE_FAIL = "Variable must be in snake case";
var UPPER_FAIL = "Variable must be in uppercase";
var KEYWORD_FAIL = "Variable name clashes with keyword/type";
var LEADING_FAIL = "Variable name must not have leading underscore";
var TRAILING_FAIL = "Variable name must not have trailing underscore";
var REGEX_FAIL = "Variable name did not match required regex";
var BANNED_KEYWORDS = ["any", "Number", "number", "String", "string",
    "Boolean", "boolean", "Undefined", "undefined"];
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var variableNameWalker = new VariableNameWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(variableNameWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var VariableChecker = (function () {
    function VariableChecker(opts) {
        var _this = this;
        this.caseCheck = "";
        this.leadingUnderscore = false;
        this.trailingUnderscore = false;
        this.banKeywords = false;
        this.regex = null;
        this.varTags = opts.filter(function (v) { return contains(VALID_VAR_TAGS, v); });
        if (contains(opts, PASCAL_OPTION)) {
            this.caseCheck = PASCAL_OPTION;
        }
        else if (contains(opts, CAMEL_OPTION)) {
            this.caseCheck = CAMEL_OPTION;
        }
        else if (contains(opts, SNAKE_OPTION)) {
            this.caseCheck = SNAKE_OPTION;
        }
        else if (contains(opts, UPPER_OPTION)) {
            this.caseCheck = UPPER_OPTION;
        }
        this.leadingUnderscore = contains(opts, LEADING_UNDERSCORE_OPTION);
        this.trailingUnderscore = contains(opts, TRAILING_UNDERSCORE_OPTION);
        this.banKeywords = contains(opts, BAN_KEYWORDS_OPTION);
        opts.forEach(function (opt) {
            if (opt.regex !== undefined) {
                _this.regex = new RegExp(opt.regex);
            }
        });
    }
    VariableChecker.prototype.requiredTagsFound = function (proposedTags) {
        var matches = true;
        this.varTags.forEach(function (tag) {
            if (!contains(proposedTags, tag)) {
                matches = false;
            }
        });
        return matches;
    };
    VariableChecker.prototype.checkName = function (name, walker) {
        var variableName = name.text;
        var firstCharacter = variableName.charAt(0);
        var lastCharacter = variableName.charAt(variableName.length - 1);
        if ((this.regex !== null) && !variableName.match(this.regex)) {
            walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), REGEX_FAIL));
        }
        if ("_" === firstCharacter) {
            if (!this.leadingUnderscore) {
                walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), LEADING_FAIL));
            }
            variableName = variableName.slice(1);
        }
        if (("_" === lastCharacter) && (variableName.length > 0)) {
            if (!this.trailingUnderscore) {
                walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), TRAILING_FAIL));
            }
            variableName = variableName.slice(0, -1);
        }
        if (this.banKeywords && contains(BANNED_KEYWORDS, variableName)) {
            walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), KEYWORD_FAIL));
        }
        if ((PASCAL_OPTION === this.caseCheck) && !isPascalCased(variableName)) {
            walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), PASCAL_FAIL));
        }
        else if ((CAMEL_OPTION === this.caseCheck) && !isCamelCase(variableName)) {
            walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), CAMEL_FAIL));
        }
        else if ((SNAKE_OPTION === this.caseCheck) && !isSnakeCase(variableName)) {
            walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), SNAKE_FAIL));
        }
        else if ((UPPER_OPTION === this.caseCheck) && !isUpperCase(variableName)) {
            walker.addFailure(walker.createFailure(name.getStart(), name.getWidth(), UPPER_FAIL));
        }
    };
    return VariableChecker;
}());
var VariableNameWalker = (function (_super) {
    __extends(VariableNameWalker, _super);
    function VariableNameWalker(sourceFile, options) {
        var _this = this;
        _super.call(this, sourceFile, options);
        this.checkers = [];
        var sub_rules = options.ruleArguments;
        sub_rules.forEach(function (rule_opts) {
            _this.checkers.push(new VariableChecker(rule_opts));
        });
    }
    VariableNameWalker.prototype.visitClassDeclaration = function (node) {
        this.checkName(node, CLASS_TAG);
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.visitMethodDeclaration = function (node) {
        this.checkName(node, METHOD_TAG);
        _super.prototype.visitMethodDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.visitInterfaceDeclaration = function (node) {
        this.checkName(node, INTERFACE_TAG);
        _super.prototype.visitInterfaceDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.visitBindingElement = function (node) {
        this.checkName(node, VARIABLE_TAG);
        _super.prototype.visitBindingElement.call(this, node);
    };
    VariableNameWalker.prototype.visitParameterDeclaration = function (node) {
        this.checkName(node, PARAMETER_TAG);
        _super.prototype.visitParameterDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.visitPropertyDeclaration = function (node) {
        this.checkName(node, PROPERTY_TAG);
        _super.prototype.visitPropertyDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.visitSetAccessor = function (node) {
        this.checkName(node, PROPERTY_TAG);
        _super.prototype.visitSetAccessor.call(this, node);
    };
    VariableNameWalker.prototype.visitGetAccessor = function (node) {
        this.checkName(node, PROPERTY_TAG);
        _super.prototype.visitGetAccessor.call(this, node);
    };
    VariableNameWalker.prototype.visitVariableDeclaration = function (node) {
        this.checkName(node, VARIABLE_TAG);
        _super.prototype.visitVariableDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.visitVariableStatement = function (node) {
        if (!Lint.hasModifier(node.modifiers, ts.SyntaxKind.DeclareKeyword)) {
            _super.prototype.visitVariableStatement.call(this, node);
        }
    };
    VariableNameWalker.prototype.visitFunctionDeclaration = function (node) {
        this.checkName(node, FUNCTION_TAG);
        _super.prototype.visitFunctionDeclaration.call(this, node);
    };
    VariableNameWalker.prototype.checkName = function (node, tag) {
        if (node.name.kind === ts.SyntaxKind.Identifier) {
            var matching_checker = this.getMatchingChecker(this.getNodeTags(node, tag));
            if (matching_checker !== null) {
                matching_checker.checkName(node.name, this);
            }
        }
    };
    VariableNameWalker.prototype.getMatchingChecker = function (varTags) {
        var matching_checkers = this.checkers.filter(function (checker) { return checker.requiredTagsFound(varTags); });
        if (matching_checkers.length > 0) {
            return matching_checkers[0];
        }
        else {
            return null;
        }
    };
    VariableNameWalker.prototype.getNodeTags = function (node, primaryTag) {
        var tags = [primaryTag];
        if (Lint.hasModifier(node.modifiers, ts.SyntaxKind.StaticKeyword)) {
            tags.push(STATIC_TAG);
        }
        if (Lint.hasModifier(node.modifiers, ts.SyntaxKind.ConstKeyword)) {
            tags.push(CONST_TAG);
        }
        if ((node.kind === ts.SyntaxKind.PropertyDeclaration) ||
            (node.kind === ts.SyntaxKind.SetAccessor) ||
            (node.kind === ts.SyntaxKind.GetAccessor) ||
            (node.kind === ts.SyntaxKind.MethodDeclaration)) {
            if (Lint.hasModifier(node.modifiers, ts.SyntaxKind.PrivateKeyword)) {
                tags.push(PRIVATE_TAG);
            }
            else if (Lint.hasModifier(node.modifiers, ts.SyntaxKind.ProtectedKeyword)) {
                tags.push(PROTECTED_TAG);
            }
            else {
                tags.push(PUBLIC_TAG);
            }
        }
        var nearest_body = nearestBody(node);
        if (!nearest_body.isSourceFile) {
            tags.push(LOCAL_TAG);
        }
        if (node.kind === ts.SyntaxKind.VariableDeclaration) {
            if (isConstVariable(node)) {
                tags.push(CONST_TAG);
            }
        }
        return tags;
    };
    return VariableNameWalker;
}(Lint.RuleWalker));
function nearestBody(node) {
    var VALID_PARENT_TYPES = [
        ts.SyntaxKind.SourceFile,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.FunctionExpression,
        ts.SyntaxKind.ArrowFunction,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.Constructor,
    ];
    var ancestor = node.parent;
    while (ancestor && !contains(VALID_PARENT_TYPES, ancestor.kind)) {
        ancestor = ancestor.parent;
    }
    return {
        containingBody: ancestor,
        isSourceFile: (ancestor && ancestor.kind === ts.SyntaxKind.SourceFile) || !ancestor,
    };
}
function isConstVariable(node) {
    var parentNode = (node.kind === ts.SyntaxKind.VariableDeclaration)
        ? node.parent
        : node.declarationList;
    return Lint.isNodeFlagSet(parentNode, ts.NodeFlags.Const);
}
function isPascalCased(name) {
    if (name.length <= 0) {
        return true;
    }
    var firstCharacter = name.charAt(0);
    return ((firstCharacter === firstCharacter.toUpperCase()) && name.indexOf("_") === -1);
}
function isCamelCase(name) {
    var firstCharacter = name.charAt(0);
    if (name.length <= 0) {
        return true;
    }
    if (!isLowerCase(firstCharacter)) {
        return false;
    }
    return name.indexOf("_") === -1;
}
function isSnakeCase(name) {
    return isLowerCase(name);
}
function isLowerCase(name) {
    return name === name.toLowerCase();
}
function isUpperCase(name) {
    return name === name.toUpperCase();
}
function contains(arr, value) {
    return arr.indexOf(value) !== -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0VmFyaWFibGVOYW1lUnVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4dFZhcmlhYmxlTmFtZVJ1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBWSxFQUFFLFdBQU0sWUFBWSxDQUFDLENBQUE7QUFDakMsSUFBWSxJQUFJLFdBQU0saUJBQWlCLENBQUMsQ0FBQTtBQXdEeEMsSUFBTSxTQUFTLEdBQU8sT0FBTyxDQUFDO0FBQzlCLElBQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQztBQUNsQyxJQUFNLGFBQWEsR0FBRyxXQUFXLENBQUM7QUFDbEMsSUFBTSxZQUFZLEdBQUksVUFBVSxDQUFDO0FBQ2pDLElBQU0sVUFBVSxHQUFNLFFBQVEsQ0FBQztBQUMvQixJQUFNLFlBQVksR0FBSSxVQUFVLENBQUM7QUFDakMsSUFBTSxZQUFZLEdBQUksVUFBVSxDQUFDO0FBRWpDLElBQU0sU0FBUyxHQUFPLE9BQU8sQ0FBQztBQUM5QixJQUFNLFVBQVUsR0FBTSxRQUFRLENBQUM7QUFDL0IsSUFBTSxTQUFTLEdBQU8sT0FBTyxDQUFDO0FBQzlCLElBQU0sVUFBVSxHQUFNLFFBQVEsQ0FBQztBQUMvQixJQUFNLGFBQWEsR0FBRyxXQUFXLENBQUM7QUFDbEMsSUFBTSxXQUFXLEdBQUssU0FBUyxDQUFDO0FBRWhDLElBQU0sY0FBYyxHQUFHLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhO0lBQ3ZDLFlBQVksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFlBQVk7SUFDcEQsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTO0lBQ2hDLFVBQVUsRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFaEUsSUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDO0FBQy9CLElBQU0sWUFBWSxHQUFJLE9BQU8sQ0FBQztBQUM5QixJQUFNLFlBQVksR0FBSSxPQUFPLENBQUM7QUFDOUIsSUFBTSxZQUFZLEdBQUksT0FBTyxDQUFDO0FBQzlCLElB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QVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7SUFDTCxDQUFD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