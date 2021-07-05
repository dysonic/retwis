import { Request, Response } from 'express';
import { AsyncRedisClient } from './index';

export const isLoggedIn = async (req: Request, client: AsyncRedisClient) => {
  if (req.session.user) {
    return true;
  }

  if (req.cookies.auth) {
    let authCookie: string | null = req.cookies.auth;
    if (authCookie && /:/.test(authCookie)) {
      authCookie = authCookie.split(/[:\.]/)[1];
    }
    const authSecret = req.session.id;

    // tslint:disable-next-line:no-console
    console.log('isLoggedin - authCookie:', authCookie, 'authSecret (session id):', authSecret);

    const userId: string | null = await client.hget('auths', authCookie);
    if (userId) {
      const userAuthCookie: string | null = await client.hget(`user:${userId}`, 'auth');
      if (authCookie !== userAuthCookie) {

        // tslint:disable-next-line:no-console
        console.log('isLoggedin - auth cookie mismatch - userAuthCookie:', userAuthCookie);
        return false;
      }
      loadUserInfo(userId, req, client);
      return true;
    }
    else {

        // tslint:disable-next-line:no-console
        console.log('isLoggedin - user session not found');
    }
  }
  return false;
}

export const loadUserInfo = async (userId: string, req: Request, client: AsyncRedisClient) => {

    // tslint:disable-next-line:no-console
    console.log('loadUserInfo - userId:', userId);

    const username = await client.hget(`user:${userId}`, 'username');
    req.session.user = {
      id: userId,
      username,
    }
    return true;
}
/*
function redisLink() {
    static $r = false;

    if ($r) return $r;
    $r = new Predis\Client();
    return $r;
}

// Access to GET/POST/COOKIE parameters the easy way
function g($param) {
    global $_GET, $_POST, $_COOKIE;

    if (isset($_COOKIE[$param])) return $_COOKIE[$param];
    if (isset($_POST[$param])) return $_POST[$param];
    if (isset($_GET[$param])) return $_GET[$param];
    return false;
}

function gt($param) {
    $val = g($param);
    if ($val === false) return false;
    return trim($val);
}
*/
export const goback = (msg: string, res: Response) => {
  res.render('back', { msg });
}
/*
function strElapsed($t) {
    $d = time()-$t;
    if ($d < 60) return "$d seconds";
    if ($d < 3600) {
        $m = (int)($d/60);
        return "$m minute".($m > 1 ? "s" : "");
    }
    if ($d < 3600*24) {
        $h = (int)($d/3600);
        return "$h hour".($h > 1 ? "s" : "");
    }
    $d = (int)($d/(3600*24));
    return "$d day".($d > 1 ? "s" : "");
}

function showPost($id) {
    $r = redisLink();
    $post = $r->hgetall("post:$id");
    if (empty($post)) return false;

    $userid = $post['user_id'];
    $username = $r->hget("user:$userid","username");
    $elapsed = strElapsed($post['time']);
    $userlink = "<a class=\"username\" href=\"profile.php?u=".urlencode($username)."\">".utf8entities($username)."</a>";

    echo('<div class="post">'.$userlink.' '.utf8entities($post['body'])."<br>");
    echo('<i>posted '.$elapsed.' ago via web</i></div>');
    return true;
}

function showUserPosts($userid,$start,$count) {
    $r = redisLink();
    $key = ($userid == -1) ? "timeline" : "posts:$userid";
    $posts = $r->lrange($key,$start,$start+$count);
    $c = 0;
    foreach($posts as $p) {
        if (showPost($p)) $c++;
        if ($c == $count) break;
    }
    return count($posts) == $count+1;
}

function showUserPostsWithPagination($username,$userid,$start,$count) {
    global $_SERVER;
    $thispage = $_SERVER['PHP_SELF'];

    $navlink = "";
    $next = $start+10;
    $prev = $start-10;
    $nextlink = $prevlink = false;
    if ($prev < 0) $prev = 0;

    $u = $username ? "&u=".urlencode($username) : "";
    if (showUserPosts($userid,$start,$count))
        $nextlink = "<a href=\"$thispage?start=$next".$u."\">Older posts &raquo;</a>";
    if ($start > 0) {
        $prevlink = "<a href=\"$thispage?start=$prev".$u."\">&laquo; Newer posts</a>".($nextlink ? " | " : "");
    }
    if ($nextlink || $prevlink)
        echo("<div class=\"rightlink\">$prevlink $nextlink</div>");
}

function showLastUsers() {
    $r = redisLink();
    $users = $r->zrevrange("users_by_time",0,9);
    echo("<div>");
    foreach($users as $u) {
        echo("<a class=\"username\" href=\"profile.php?u=".urlencode($u)."\">".utf8entities($u)."</a> ");
    }
    echo("</div><br>");
}
*/
