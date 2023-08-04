var selectedDivision;
var isVVIP;

$(document).ready(function () {
    //ProcessState('start', 'select');
});

$("#loading-modal").on('shown.bs.modal', function () {
    let that = $(this);
    if (that.data('state') == "start") {
        let action = that.data('action');
        switch (action) {
            case 'select':
                LoadSelection();
                break;
            case 'load':
                LoadData(selectedDivision, true);
                break;
            case 'save':
                Save();
                break;
            case 'division': //update utilization
                LoadData(selectedDivision, true, 'division');
                break;
        }
    }
});

//Division Selection

//load division selection
function LoadSelection() {
    $.ajax({
        url: $('#selection-modal').data('request-url'),
        type: 'GET',
        success: function (models) {
            let select = $('#selection-modal').find('select');
            $(select).children().slice(1).remove();
            if (models.length < 1) {
                $('.selection').toggleClass('d-none');
                $('.no-division').toggleClass('d-none');
            }
            else {
                models.forEach(function (division, index) {
                    $(select).append('<option value="' + division.CSID + '">' + division.Name + '</option>')
                });
            }

            selectionModal.show();
            ProcessState('stop');
        },
        error: function (xhr) {
            console.log("error: " + xhr.responseText);
            alert("error:" + xhr.responseText);
        }
    });
}

// to load division info once the user selects a division
$('#selection-modal .btn-primary').click(function () {
    let select = $('.selection select option:selected');
    selectedDivision = {
        CSID: validateTime($(select).val()),
        Name: $(select).text()
    };
    ////currently all pages only use a single same page lock
    //SetAgencyUnlockID(selectedDivision.CSID); 
    console.log(selectedDivision);
    if (selectedDivision != null && selectedDivision.CSID != null && selectedDivision.CSID.substring(0, 1) != "]") {
        selectionModal.hide();
        $('.selected-division').html(selectedDivision.Name);
        ProcessState('start');
    }
});

//to re-open the division selection modal
$('#select-division').click(function () {
    selectionModal.show();
});

// to enable the ok button if the user selects a valid division
$('.selection select').change(function () {
    let button = $('.selection .btn-primary');
    if ($('.selection select').val() == null)
        $(button).addClass('disabled');
    else $(button).removeClass('disabled');
});

//Data Loading

function LoadData(division, initial, update = 'all') {
    console.log("LoadData initial/update status: " + division.Name, initial + "/" + update);
    division.Update = update;
    if (update == 'all') {
        $('input[type=text]').not("#Email").val(0);
        $('input[type=number]').val(90);
        $('#Email').val('');
    } else {
        $('input.utilized').val(0);
    }

    $.ajax({
        url: $('#division-form').data('request-url'),
        data: JSON.stringify(division),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: 'POST',
        success: function (data) {
            if (data.Address) {
                window.location.replace(data.Address); //to redirect user if no access
            }
            console.log(data);

            let InputSize = $('#TotalSize');
            let InputThreshold = $('#AlertThreshold');

            if (update == 'all') {
                InputSize.val(byteToGB(data.TotalSize));
                InputThreshold.val(data.AlertThreshold);
                $('#Email').val(data.EmailNotification);

                //VVIP storage can modify limit while non-VVIP will use fixed default value
                if (data.IsVVIP) {
                    isVVIP = true;
                    InputSize.removeAttr("disabled");
                    InputThreshold.removeAttr("disabled");
                }
                else {
                    isVVIP = false;
                    InputSize.prop("disabled", "disabled");
                    InputThreshold.prop("disabled", "disabled");
                }
            }

            if (update == 'division' || update == 'all') {
                $('#UtilizedSize').val(byteToGB(data.UtilizedSize));
                $('#UtilizedSizeMB').val(byteToMB(data.UtilizedSize));
            }

            if (initial) {
                ProcessState('stop');
            }
            else ProcessState('saved');

            //Revalidate(); //should revalidate every data load to make sure invalid button gets reset
        },
        error: function (xhr) {
            console.log("error: " + xhr.responseText);
            alert("error:" + xhr.responseText);
        }
    });
}



$('.update-division').click(function () {
    ProcessState('start', 'division');
});


//Save Action
$('.save').click(function () {

    //trigger html5 email validation
    if (!document.getElementById('to-check-email').reportValidity() && $('#Email').val().length > 0)
        return;

    ProcessState('start', 'save');
});

function Save() {
    let dataObj = new Object();
    dataObj.CSID = selectedDivision.CSID;
    dataObj.IsVVIP = isVVIP;
    if (isVVIP) {
        dataObj.TotalSize = GBToByte($("#TotalSize").val());
        dataObj.AlertThreshold = $("#AlertThreshold").val();
    }
    dataObj.EmailNotification = $("#Email").val();

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
            LoadData(selectedDivision, false);
        },
        error: function (xhr) {
            console.log("error: " + xhr.responseText);
            alert("error:" + xhr.responseText);
        }

    });
}

//Validations

//Validations - threshold

$('input[type=number]').on('input', function () {
    let that = $(this);
    let intVal = parseInt(that.val());
    console.log("a");
    if (intVal > 100)
        that.val(100);
});

$('input[type=number]').on('change', function () {
    let that = $(this);
    let intVal = parseInt(that.val());
    if (intVal < 10)
        that.val(10);
    else if (Number.isNaN(intVal))
        that.val(100);
});

//storage validation
$('#TotalSize').on("input", function (event) {
    $(this).val($(this).val().replace(/[^0-9.]/g, ""));
    if (event.which < 48 || event.which > 57 && event.which != 46) {
        event.preventDefault();
    }
    validateInput();
});

//validate vvip storage size value
$('#TotalSize').on("change", function (event) {
    if ($(this).val().length < 1)
        $(this).val(0);
    $(this).val(toFloatCustom($(this).val()));
    validateInput();
});

function validateInput() {
    let inputEl = $('#TotalSize');
    if (inputEl.prop('disabled') == 'disabled') //skip for non-vvip
        return;

    let allocatedSize = toFloatCustom(inputEl.val());
    let utilizedSize = toFloatCustom($('#UtilizedSize').val());
    let invalidClass = 'border border-2 border-danger';
    if (allocatedSize == 0 || Number.isNaN(allocatedSize) || allocatedSize < utilizedSize) {
        $('.size-alert').removeClass('d-none');
        inputEl.addClass(invalidClass);
        $('.save').attr('disabled', 'disabled');
    }
    else {
        $('.size-alert').addClass('d-none');
        inputEl.removeClass(invalidClass);
        $('.save').removeAttr('disabled');
    }
}