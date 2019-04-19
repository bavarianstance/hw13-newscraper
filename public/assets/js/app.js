$(()=>{
    // declare functions
    const scrapeArticles = ()=>{
        $.get('/scraper')
        .then((data)=>{
            $('body').html(data);
        });
    };

    const saveArticle = function() {
        let id = $(this).data('id');

        $.ajax({
            url: `/article/${id}`,
            method: 'PUT'
        })
        .then((data)=>{
            location.reload();
        });
    };

    const removeArticle = function() {
        let id = $(this).data('id');
        
        $.ajax({
            url: `/article/remove/${id}`,
            method: 'PUT'
        })
        .then((data)=>{
            location.reload();
        });
    };

    const viewNotes = function() {
        let articleId = $(this).data('id');

        // send request to get article's notes if exist
        $.ajax({
            url: `/articles/${articleId}`,
            method: 'GET'
        })
        .then((data)=>{
            // create modal with article id
            $('.modal-content').html(`
                <div class="modal-header">
                    <h5 class="modal-title">${data.title}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <ul class="list-group"></ul>
                    <textarea name="note" class="note-content"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" data-id="${data._id}" class="btn btn-primary btn-save-note">Save Note</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>`
            );

            let totalNotes = data.note.length;

            // if there is no note
            if (totalNotes == 0) {
                let message = `<small class="text-muted">This article doesn't have any note yet.</small>`;
                $('.modal-body').prepend(message);
            }
            // if there is/are note(s)
            else {
                let notes = data.note;
                // loop through notes and append to modal
                notes.forEach(note =>{
                    $('.list-group').append(`
                        <li class="list-group-item justify-content-between">
                            ${note.body}
                            <span><i class="material-icons" data-id="${note._id}">delete_forever</i></span>
                        </li>
                    `);
                });
            }
            
            $('.modal').modal('show');
        });
    };

    const saveNote = function() {
        let id = $(this).data('id');
        let content = $('.note-content').val().trim();

        if (content) {
            $.ajax({
                url: `/notes/${id}`,
                method: 'POST',
                data: {body: content}
            })
            .then((data)=>{
                // clear textarea
                $('.note-content').val('');
                // hide modal
                $('.modal').modal('hide');
            });
        }
        else {
            $('.note-content').val('');
            return;
        }
    };

    const deleteNote = function() {
        let id = $(this).data('id');

        $.ajax({
            url: `/notes/${id}`,
            method: 'DELETE'
        })
        .then((data)=>{
            // hide modal
            $('.modal').modal('hide');
        });
    };

    // hide scrape button if on page 'saved'
    if (window.location.href.includes('saved')) {
        $('.scraper').hide();
    }

    // keep scrollbar bottom
    const contentBox = $('.note-content');
    contentBox.scrollTop = contentBox.scrollHeight;

    // click events
    $('.scraper').on('click', scrapeArticles);
    $('.clip-button').on('click', saveArticle);
    $('.delete-button').on('click', removeArticle);
    $('.notes-button').on('click', viewNotes);
    // handle click events for elements created dynamically
    $(document).on('click', '.btn-save-note', saveNote);
    $(document).on('click', '.material-icons', deleteNote);
});