function SetAgencyUnlockID(id) {

    //unlock the current agency before the user changing agency
    let unlockButton = $('.btn-unlock');
    let agencyID = unlockButton.data('agency-id');
    console.log(agencyID);
    if (agencyID != null && agencyID > 0) {
        //do it asynchronously
        $.get(FormatUnlockUrl(unlockButton.get()) + "&async=true");
    }

    //replace current id with incoming id
    unlockButton.data('agency-id', id);
}