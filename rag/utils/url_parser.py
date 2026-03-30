from urllib.parse import urlparse , parse_qs




#Extracting the url
def get_video_id(url):

    url= url.strip()

    parsed = urlparse(url)
    # Query of url
    print(parsed.query)

    # parse_qs converting query to dict so that we can fetch value(id)
    params= parse_qs(parsed.query)
    if 'v' not in params:
        raise ValueError(f"No video id Found in URL :{url}")

    return params['v'][0] # video ID
