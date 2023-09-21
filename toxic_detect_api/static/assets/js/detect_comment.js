$(document).ready(function () {
    let comment = $('#comment_text');
    let submit = $('#confirm');
    let clear = $('#clear');
    let toxic = $('#toxic');
    let severe_toxic = $('#severe_toxic');
    let obscene = $('#obscene');
    let threat = $('#threat');
    let insult = $('#insult');
    let identity_hate = $('#identity_hate');

    clear.click(function () {
        comment.val('');
        toxic.text('0');
        severe_toxic.text('0');
        obscene.text('0');
        threat.text('0');
        insult.text('0');
        identity_hate.text('0');
    }
    );


    submit.click(function () {
        var formdata = new FormData();
        formdata.append("comments", comment.val());
        var requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
        };

        fetch("/api/detect/", requestOptions)
            .then(response => response.text())
            .then(result => {
                let prediction = JSON.parse(result);
                setResutl(prediction[0]['prediction']);
            })
            .catch(error => console.log('error', error));

    });

    function setResutl(prediction) {
        console.log(prediction);
        toxic.text(parseFloat(prediction['toxic'] * 100).toFixed(2) + ' %');
        severe_toxic.text(parseFloat(prediction['severe_toxic'] * 100).toFixed(2) + ' %');
        obscene.text(parseFloat(prediction['obscene'] * 100).toFixed(2) + ' %');
        threat.text(parseFloat(prediction['threat'] * 100).toFixed(2) + ' %');
        insult.text(parseFloat(prediction['insult'] * 100).toFixed(2) + ' %');
        identity_hate.text(parseFloat(prediction['identity_hate'] * 100).toFixed(2) + ' %');
    }

});
