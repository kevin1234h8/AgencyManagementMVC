var folders;
var users;
var decimalDigit = 3;
var mode = "";
var rowID = 0;

$(document).ready(function () {
    //ProcessState('start');
});


//document.getElementById("appraisalFileLocation_BTN").addEventListener("click", ResetAppraisalBrowser);
//function ResetAppraisalBrowser() {
//    showNodePicker();
//}

//$("#loading-modal").on('shown.bs.modal', function () {
//    let that = $(this);
//    if (that.data('state') == "start") {
//        let action = that.data('action');
//        console.log(action);
//        switch (action) {
//            case 'load':
//                console.log('load')
//                LoadData(true);
//                break;
//            case 'save':
//                Save();
//                break;
//            case 'shared': //update utilization
//            case 'personal': //update utilization
//                LoadData(true, action)
//                break;
//        }
//    }
//});

//Data

//function LoadData(initial, update = 'all') {
//    if (update == 'all') {
//        $('input[type=text]').not("#Email").val(0);
//        $('input[type=number]').val(90);
//        $('option').attr('selected', false);
//        $('table tbody').html('');

//        //scheduler
//        $('.time select').val('am');
//        $('.time input[type=text]:nth(0)').val('01');
//        $('.time input[type=text]:nth(1)').val('00');
//        $('.days button').removeClass('selected');
//        $("#Email").val('');
//    } else {
//        $('table.' + update + ' tbody').html('');
//    }
//    console.log(update)

//    let formData = {
//        Update: update
//    };

//    $.ajax({
//        url: $('.content').data('request-url'),
//        data: JSON.stringify(formData),
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        type: 'POST',
//        success: function (data) {
//            if (data.Address) {
//                window.location.replace(data.Address); //to redirect user if no access
//            }
//            console.log(data);
//            if (update == 'all') {
//                //dropdowns
//                folders = data.Folders;
//                users = data.Users

//                //scheduler
//                let generalSettings = data.General;
//                generalSettings.forEach(function (setting, index) {
//                    switch (setting.Name) {
//                        case 'MID':
//                            $('.time select').val(setting.Value);
//                            break;
//                        case 'HR':
//                            $('.time input[type=text]:nth(0)').val(setting.Value);
//                            break;
//                        case 'MIN':
//                            $('.time input[type=text]:nth(1)').val(setting.Value);
//                            break;
//                        case 'DAYS':
//                            if (setting.Value != null) {
//                                let days = setting.Value.split(',');
//                                days.forEach(function (value) {
//                                    $('.days button[value=' + value + ']').toggleClass('selected');
//                                });
//                            }
//                            break;
//                        case 'DefaultSharedLimit':
//                            $('#default-shared-limit').val(byteToGB(setting.Value));
//                            break;
//                        case 'DefaultSharedThreshold':
//                            $('#default-shared-threshold').val(setting.Value);
//                            break;
//                        case 'DefaultPersonalLimit':
//                            $('#default-personal-limit').val(byteToGB(setting.Value));
//                            break;
//                        case 'DefaultPersonalThreshold':
//                            $('#default-personal-threshold').val(setting.Value);
//                            break;
//                        case 'Email':
//                            $('#Email').val(setting.Value);
//                            break;
//                    }
//                });
//            }

//            if (data.hasOwnProperty("Storage") && data.Storage != null) {
//                data.Storage.forEach(function (setting) {
//                    let type = setting.Type;
//                    let items = (type == "shared" ? folders : users);
//                    //skip if folder deleted
//                    const found = items.some(item => item.CSID === setting.CSID);

//                    if ((update != 'all' && update != type) || !found) //filter based on type
//                        return; //return is equal as continue in array.forEach

//                    AddRow(type, true);
//                    let latestRow = $('table.' + type + ' tbody tr:last-child');
//                    latestRow.children().eq(0).children().val(setting.CSID); //level 2 folder
//                    latestRow.children().eq(1).children().val(byteToGB(setting.TotalSize)); //allocated size
//                    latestRow.children().eq(2).html(byteToGB(setting.UtilizedSize) + " (" + byteToMB(setting.UtilizedSize) + " MB)"); //utilized size
//                });
//            }

//            if (initial) {
//                ProcessState('stop');
//            }
//            else ProcessState('saved');

//            Revalidate(); //should revalidate every data load to make sure invalid button gets reset
//        },
//        error: function (xhr) {
//            console.log("error: " + xhr.responseText);
//            alert("error:" + xhr.responseText);
//        }
//    });
//}


//Sections

$('.section-title').children().click(function () { //on caret or h3 click
    let sectionDiv = $(this).parent();
    let wrapper = sectionDiv.next('.section-wrapper');
    let caret = sectionDiv.children('.caret');
    wrapper.toggleClass('slide-up');
    caret.toggleClass('caret-collapse');
});

function AddRow(type, rowID) {
    let label = type == "shared" ? "Shared" : "Personal";

    $('table.' + type + ' tbody').append('\
            <tr data-type="'+ type + '">\
                <td><input id=\'' + "folderinput" + rowID + '\' style="display: inline-block; width: 70%;" type="text" class="form-control"/><button id=\'' + "folderbutton" + rowID + '\' style="margin-bottom: 5px;" class="btn btn-info" tabindex="-1">Browse</button></td>\
                <td><input type="number" class="form-control" value="0"/></td>\
                <td><button class="btn btn-dark remove-row" tabindex="-1">REMOVE</button></td>\
            </tr>\
        ');


    $(document).on('click', '#folderbutton' + rowID, function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var nodeInfo = showNodePicker(rowID);
        console.log(nodeInfo);
    });

    //if (!disabled)
    //    Revalidate(); //validate table content only when add thru button
}

$('.add-shared').click(function () {
    rowID++
    AddRow('shared', rowID);
});

$('.add-personal').click(function () {
    AddRow('personal');
});

//disable duplicate option for folder dropdown
$('table').on('change click keydown', 'select', function () {
    let that = $(this); // clicked <select> element
    let options = that.children('[value!=""]'); //only selects option item with value
    let selected = that.parent().parent().siblings().not('.d-none'); //get every other rows element (skip the hidden(deleted) one)
    let className = that.hasClass('shareds') ? '.shareds' : '.personals';

    options.removeAttr('disabled'); //to start over
    selected.each(function (index, select) {
        that.children('option[value="' + $(select).find(className).val() + '"]').attr('disabled', true);
    });
});

$('.update-personal, .update-shared').click(function () {
    let type = ($(this).hasClass('update-shared') ? 'shared' : 'personal');
    //ProcessState('start', type);
});

//remove row button
$('table').on('click', '.remove-row', function () {
    let selectedRow = $(this).parent().parent(); //get selected <tr>
    let registeredFolder = selectedRow.find('select[disabled="disabled"]').first();

    if (registeredFolder.length == 1) {
        let element = $(confirmationModal._element);
        let label = element.find('.modal-message b').first();
        let btnYes = element.find('.btn-yes').first();
        let selectedFolder = registeredFolder.children(':selected');
        btnYes.data('index', $('table tr').index(selectedRow));
        label.html(selectedFolder.text());
        confirmationModal.show();
    }
    else {
        selectedRow.remove();
        //Revalidate();
    }
});



//Scheduler Form

$('.days button').click(function () {
    $(this).toggleClass('selected');
});

function midCheck(value) {
    return value == "am" ? "am" : "pm";
}

function LimitTime(that, increment = false) {
    let intVal = parseInt(that.val());

    if (that.val() == '0' && !increment) return;
    if (that.parent().index() == 0) {
        if (intVal < 1)
            that.val(increment ? '12' : '01');
        else if (intVal > 12)
            that.val(increment ? '01' : '12');
    }
    else if (that.parent().index() == 2) {
        if (intVal > 59)
            that.val(increment ? '00' : '59');
        else if (intVal < 0 && increment)
            that.val('59');
    }
}

$('.time button').click(function () {
    let that = $(this);
    let input = that.parent().find('input[type=text]');
    if (that.children().hasClass('plus')) {
        input.val(parseInt(input.val()) + 1);
    }
    else if (that.children().hasClass('minus')) {
        input.val(parseInt(input.val()) - 1);
    }
    LimitTime(input, true);
    input.change();
});

//Validations

//time validation
$('.time').on("input", "input[type=text], input[type=number]", function (event) {
    $(this).val($(this).val().replace(/\D/g, "0"));
    if ($(this).attr('type') == 'text')
        LimitTime($(this));
    if ((event.which < 48 || event.which > 57)) {
        event.preventDefault();
    }
});

$('.time input[type=text]').change(function () {
    let that = $(this);
    while (that.val().length < 2) {
        if (that.parent().index() == 0 && that.val() == '0')
            that.val(1);
        else
            that.val('0' + that.val());
    }
});

//validate vvip storage size value
$('.table, span.default-limit').on("input", 'input[type=text]', function (event) {
    $(this).val($(this).val().replace(/[^0-9.]/g, ""));
    if (event.which < 48 || event.which > 57 && event.which != 46) {
        event.preventDefault();
    }

    Revalidate();
});

$('.table, span.default-limit').on("change", "input[type=text]", function (event) {
    if ($(this).val().length < 1)
        $(this).val(0);
    $(this).val(toFloatCustom($(this).val()));
});

//covers all input value change (text and dropdown)
$('.table, .default-limit').on('change', function () {
    Revalidate();
});

//validate storage size value
function Revalidate() {
    console.log('revalidate');
    let invalidInput = {
        default: 0,
        folder: 0,
        size: 0
    }
    let invalidClass = 'border border-2 border-danger';
    let defaults = $('.default-limit input[type=text]');
    let selects = $('table select');
    let storageSizes = $('table input[type="text"]');

    //default (non-vvip) size limit
    defaults.each(function () {
        let input = $(this);
        if (input.val().length < 1 || input.val() == 0) {
            invalidInput.size++;
            input.addClass(invalidClass);
        }
        else {
            input.removeClass(invalidClass);
        }
    });

    //vvip folder dropdown
    selects.each(function () {
        let that = $(this);
        if (that.val() == null) {
            invalidInput.folder++;
            that.addClass(invalidClass);
        } else {
            that.removeClass(invalidClass)
        }
    });

    //vvip size limit
    storageSizes.each(function () {
        let input = $(this);
        let storageSize = input.val().length > 0 ? toFloatCustom(input.val()) : 0;
        let row = input.parent().parent(); //first parent is td, then tr is the td parent which is our target
        let utilizedSize = toFloatCustom(row.children('.utilizedSizes').html());
        if (storageSize == 0 || storageSize < utilizedSize) {
            invalidInput.size++;
            input.addClass(invalidClass);
        } else {
            input.removeClass(invalidClass);
        }
    });

    let errorInfo = $('#floating-error');
    let invalidCount = invalidInput.folder + invalidInput.size;

    if (invalidCount > 0) {
        $('.save').addClass('disabled');

        //adjust badge
        errorInfo.find('.badge').first().html(invalidCount);
        errorInfo.find('.btn-folder .badge').html(invalidInput.folder);
        errorInfo.find('.btn-size .badge').html(invalidInput.size);

        let buttons = errorInfo.find('button');
        buttons.each(function () {
            let button = $(this);
            if (button.find('.badge').text() != 0) {
                button.addClass('d-flex');
                button.removeClass('d-none');
            } else {
                button.addClass('d-none');
                button.removeClass('d-flex');
            }
        });

        errorInfo.removeClass('d-none');
    }
    else {
        $('.save').removeClass('disabled');
        errorInfo.addClass('d-none');
    }
};


//Validations - threshold

//$('input[type=number]').on('input', function () {
//    let that = $(this);
//    let intVal = parseInt(that.val());
//    if (intVal > 100)
//        that.val(100);
//});

//$('input[type=number]').on('change', function () {
//    let that = $(this);
//    let intVal = parseInt(that.val());
//    if (intVal < 10)
//        that.val(10);
//    else if (Number.isNaN(intVal))
//        that.val(100);
//});

//Cancel Action
$('.cancel').click(function () {
    window.location.reload();
});

//Save Action
$('.save').click(function () {

    //trigger html5 email validation
    if (!document.getElementById('to-check-email').reportValidity() && $('#Email').val().length > 0)
        return;
    //ProcessState('start', 'save');
});

function Save() {
    let dataObj = new Object();
    let storageSettings = new Array();
    let generalSettings = new Array();

    //vvip storages
    let rows = $('tbody tr').not('.d-none');
    rows.each(function (index, row) {
        let CSID = $(row).children().eq(0).children().val();
        let size = $(row).children().eq(1).children().val();
        let type = $(row).data('type');
        if (CSID != null && toFloatCustom(size) > 0) {
            storageSettings.push({
                "CSID": CSID,
                "TotalSize": GBToByte(size),
                "Type": type
            });
        }
    });

    //general settings
    let days = "";
    $('.days button.selected').each(function (index, button) {
        days += $(button).val() + ",";
    });
    if (days.length > 0) //remove last comma
        days = days.substring(0, days.length - 1);

    generalSettings.push(
        { Name: "DefaultSharedLimit", Value: GBToByte($('#default-shared-limit').val()) },
        { Name: "DefaultSharedThreshold", Value: $('#default-shared-threshold').val() },
        { Name: "DefaultPersonalLimit", Value: GBToByte($('#default-personal-limit').val()) },
        { Name: "DefaultPersonalThreshold", Value: $('#default-personal-threshold').val() },
        { Name: "DAYS", Value: days },
        { Name: "HR", Value: validateTime($('.time input[type=text]:nth(0)').val()) },
        { Name: "MIN", Value: validateTime($('.time input[type=text]:nth(1)').val()) },
        { Name: "MID", Value: midCheck($('.time select').val()) },
        { Name: "Email", Value: validateEmail($('#Email').val()) }
    );

    dataObj.General = generalSettings;
    dataObj.Storage = storageSettings;

    console.log(dataObj);

    $.ajax({
        url: $('.save').data('request-url'),
        data: JSON.stringify(dataObj),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: 'POST',
        success: function (data) {
            console.log(data);
            if (data.Address) {
                window.location.replace(data.Address); //to redirect user if no access
            }
            LoadData(false);
        },
        error: function (xhr) {
            console.log("error: " + xhr.responseText);
            alert("error:" + xhr.responseText);
        }

    });
}