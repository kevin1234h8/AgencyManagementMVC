function ShowSaveCancel(status) {
    if (status) $('.save,.cancel').removeClass('d-none');
    else $('.save,.cancel').addClass('d-none');
}