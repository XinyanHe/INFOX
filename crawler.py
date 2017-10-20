import os
import json
import requests

author_name = 'shuiblue'
project_name = 'INFOX'
save_path = './tmp/%s_%s'
access_token = 'your_personal_access_token'
commits_page_limit = 1

base_url = 'https://api.github.com/repos/%s/%s?access_token=%s'
base_url_with_page = 'https://api.github.com/repos/%s/%s/%s?page=%d&access_token=%s'
api_limit_error = 'API rate limit exceeded'

def write_to_file(file, obj):
    path = os.path.dirname(file)
    if not os.path.exists(path):
        os.makedirs(path)
    print 'start write %s to file....' % file
    with open(file, 'w') as write_file:
        write_file.write(json.dumps(obj))
    print 'finish writing!'

# type contains: forks, branches, commits.
# page_iter means it will get all the items.
def get_api(author, repo, type="", page_iter=True):
    if not page_iter:
        try:
            response = requests.get(base_url % (author, repo, access_token))
            if api_limit_error in response.text:
                raise Exception(api_limit_error)
        except requests.RequestException as error:
            print(error)
        return response.json()
    page_num = 0
    result = []
    while True:
        page_num += 1
        if type == "commits" and page_num > commits_page_limit:
            break
        # print('page_num = %d' % page_num)
        try:
            response = requests.get(base_url_with_page % (author, repo, type, page_num, access_token))
            if api_limit_error in response.text:
                raise Exception(api_limit_error)
        except requests.RequestException as error:
            print(error)
        json_result = response.json()
        if not json_result:
            break
        for item in json_result:
            result.append(item)
    print 'finish crawling! Get %d %s !' % (len(result), type)
    return result

def main():
    main_pain = save_path % (author_name, project_name)

    repo_info = get_api(author_name, project_name, "", False)
    write_to_file(main_pain + '/repo_info.json', repo_info)

    forks_list = get_api(author_name, project_name, 'forks')
    write_to_file(main_pain + '/forks.json', forks_list)

    # get all forks' commits
    for fork in forks_list:
        author, repo = fork["full_name"].split('/')
        commits_list = get_api(author, repo, "commits")
        write_to_file(main_pain + '/' + author + '/commits.json', commits_list)

if __name__ == '__main__':
    main()

