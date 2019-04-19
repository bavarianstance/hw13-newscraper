// $(()=>{
    // declare functions
    const scrapeArticles = () =>{
        $.get('/scraper')
        .then((data)=>{
            // was causing redeclaration error
            // $('body').html(data);
            location.reload();
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


        $.ajax({
            url: `/article/${articleId}`,
            method: 'GET'
        })
        .then((data)=>{

            $(".modal-content").html(`
                <div class="modal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                    <div class="modal-content">
                     <div class="modal-header">
                      <h5 class="modal-title">${data.title}</h5>
                 <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
              </button>
              </div>
      <div class="modal-body">
        <ul class="list-group"></ul>
        <textarea id="add-note" class="form-control note-content" placeholder="enter your note here..."></textarea>
      </div>
          <div class="modal-footer">
        <button type="button" data-id="${data._id}" class="btn btn-primary btn-save-note">Save Note</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`);

            // console.log(data);
            // console.log(data.note);
            let notes = data.note;


            if (notes.length === 0) {
                let message = `<small class="text-muted">This article doesn't have any note(s) yet.</small>`;
                $('.modal-body').prepend(message);
            }
            else {
                console.log(notes);
                // loop through notes and append to modal
                notes.forEach(note =>{
                    $('.list-group').append(`
                        <li class="list-group-item justify-content-between">
                            ${note.body}
                            <span><i class="fas fa-trash-alt" data-id="${note._id}"></i></span>
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
                url: `/note/${id}`,
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
            url: `/note/${id}`,
            method: 'DELETE'
        })
        .then((data)=>{
            // hide modal
            $('.modal').modal('hide');
        });
    };

    // hide scrape button if on page 'clipped'
    if (window.location.href.includes('clipped')) {
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
    $(document).on('click', '.fa-trash-alt', deleteNote);
// });